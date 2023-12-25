import { useContext, useEffect, useRef, useState } from "react";
import Loading from "../../../components/Loading";
import Input from "../../../components/input";

import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../../contexts/auth";
import Toast from "../../../components/Toast";
import createAxiosInstance from "../../../axios";
import Select from "react-select";

export default function UpdateProduct() {
    const [isLoading, setIsLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [temporaryImages, setTemporaryImages] = useState([]);
    let { id } = useParams();
    const auth = useContext(AuthContext);
    const axios = createAxiosInstance(auth);
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState([]);
    const [progress, setProgress] = useState(0);
    const [categories, setCategories] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const attri = useRef(null);
    const [varients, setVarients] = useState([]);
    const [attributes, setAttributes] = useState([]);
    const [optionsInput, setOptionsInput] = useState("");
    // const [discount, setdiscount] = useState({
    //   discount : "",
    //   type : "percent",
    //   start_date : formatDate(Date.now()),
    //   end_date : formatDate(Date.now() + + 7 * 24 * 60 * 60 * 1000),
    // });

    const addDiscount = () => {
        axios
            .post("/api/discount", { ...discount, product_id: id })
            .then((response) => {
                console.log(response.data.discount);
                Toast.notifyMessage("success", "discount added");
                setDiscounts([...discounts, response.data.discount]);
            });
    };

    function formatDate(date) {
        var d = new Date(date),
            month = "" + (d.getMonth() + 1),
            day = "" + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = "0" + month;
        if (day.length < 2) day = "0" + day;

        return [year, month, day].join("-");
    }

    const [product, setProduct] = useState({
        name: "",
        slug: "",
        small_description: "",
        description: "",
        price: "",
        quantity: "",
        images: [],
        tags: [],
        category_id: 12,
    });

    useEffect(() => {
        if (!id) return navigate("/admin/products");
    }, [id]);

    const fetchProduct = () => {
        axios
            .get(`/api/product/${id}`)
            .then((response) => {
                const data = response.data.data;

                setProduct({
                    ...data,
                    category_id: data.category?.id,
                    images:
                        data.images?.map((image) => ({
                            id: image.id,
                            url: image.url,
                            file: image.url,
                        })) || [],
                    tags: Array.from(
                        data.tags?.map((tag) => {
                            return {
                                value: tag.id,
                                label: tag.name,
                            };
                        }) || []
                    ),
                    discounts: data.discounts,
                });
                setAttributes(Array.from(data.attributes));
                setVarients(Array.from(data.varients));
                console.log([
                    ...data.varients
                ])
                setTemporaryImages(data.images || []);
            })
            .catch((error) => {
                if (error.response.status === 404) {
                    Toast.notifyMessage("error", "Product not found");
                    return navigate("/admin/dashboard");
                }
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesResponse, tagsResponse] = await Promise.all([
                    axios.get("api/category?type=all"),
                    axios.get("/api/tag?type=all"),
                ]);

                setCategories(categoriesResponse.data.data);

                const tagsFromResponse = tagsResponse.data.data.map((tag) => ({
                    value: tag.id,
                    label: tag.name,
                }));

                setSuggestions(tagsFromResponse);
                fetchProduct();
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, auth.permissions]);

    const deleteDiscount = (id) => {
        if (confirm("are ypu sure you want to delte this discount?")) {
            axios
                .delete(`/api/discount/${id}`)
                .then((response) => {
                    Toast.notify("success", response.data[0].message);
                })
                .catch((error) => {
                    console.log(error);
                    Toast.notifyMessage("error", "an error occur");
                });
        }
    };

    const handleRemoveImage = (image) => {
        setProcessing(true);

        if (image.id !== null) {
            axios
                .post(`/api/product/deleteImage`, {
                    id: id,
                    image_id: image.id,
                })
                .then(() => {
                    const updatedTemporaryImages = temporaryImages.filter(
                        (img) => img.id !== image.id
                    );
                    setTemporaryImages(updatedTemporaryImages);
                })
                .catch((error) => {
                    console.error("Error deleting image: ", error);
                    Toast.notifyMessage("error", "Error deleting image");
                })
                .finally(() => {
                    setProcessing(false);
                });
        } else {
            const updatedTemporaryImages = temporaryImages.filter(
                (img) => img.file !== image.file
            );
            setTemporaryImages(updatedTemporaryImages);
        }
    };

    const [errors, setErrors] = useState([]);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);

        if (Array.from(temporaryImages).length + files.length > 5) {
            Toast.notifyMessage(
                "error",
                "you cannot upload more than  images for single product"
            );
            return;
        }

        const formData = new FormData();

        files.forEach((file) => {
            formData.append("images[]", file);
        });

        axios
            .post(`/api/product/uploadImage/${id}`, formData, {
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                },
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then((response) => {
                const uploadedImages = response.data.images;
                const imagesToAdd = uploadedImages.map((image) => ({
                    id: image.id,
                    url: image.url,
                    file: image.url,
                }));

                setProduct((prevProduct) => ({
                    ...prevProduct,
                    images: [...prevProduct.images, ...imagesToAdd],
                }));
                setTemporaryImages([...temporaryImages, ...imagesToAdd]);
            })
            .catch((error) => {
                Toast.notify("error", error.response.data.message);
            })
            .finally(() => {
                setProgress(0);
            });
        event.target.value = "";
    };

    const handleTagChange = (selectedOptions) => {
        setProduct({
            ...product,
            tags: selectedOptions,
        });
    };

    useEffect(() => {
        setProduct({ ...product, slug: product.name.replace(/\s+/g, "-") });
    }, [product.name]);

    const handleSubmission = async (event) => {
        event.preventDefault();
        setProcessing(true);
        const formData = new FormData();

        formData.append("_method", "PUT");

        for (const key in product) {
            if (key !== "images" && key !== "tags") {
                formData.append(key, product[key]);
            }
        }

        if (product.tags) {
            Array.from(product.tags).map((tag) => {
                formData.append("tags[]", tag.value);
            });
        }

        formData.append("category_id", product.category_id);
        axios
            .post(`/api/product/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            .then(() => {
                navigate("/admin/products");
            })
            .catch((error) => {
                console.log("error: ", error);
            })
            .finally(() => {
                setProcessing(false);
            });
    };

    return (
        <>
            {isLoading ? (
                <Loading size="large" />
            ) : (
                <form
                    onSubmit={handleSubmission}
                    action=""
                    className="lg:w-3/4 sm:grid mt-3 rounded shadow-2xl sm:grid-cols-2 sm:gap-3 mx-auto justify-center p-4"
                >
                    <h2
                        className="text-center font-bold text-3xl text-indigo-600"
                        style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
                    >
                        Product
                    </h2>
                    <Input
                        label="name"
                        type="text"
                        value={product.name}
                        onChange={(event) =>
                            setProduct({ ...product, name: event.target.value })
                        }
                        error={errors?.name || null}
                        placeholder="name"
                    />
                    <Input
                        label="slug"
                        type="text"
                        value={product.slug}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(event) =>
                            setProduct({ ...product, slug: event.target.value })
                        }
                        error={errors?.slug || null}
                        placeholder="slug"
                    />
                    <Input
                        label="small_description"
                        type="text"
                        value={product.small_description}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(event) =>
                            setProduct({
                                ...product,
                                small_description: event.target.value,
                            })
                        }
                        error={errors?.small_description || null}
                        placeholder="small_description"
                    />
                    <Input
                        label="description"
                        type="text"
                        value={product.description}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(event) =>
                            setProduct({
                                ...product,
                                description: event.target.value,
                            })
                        }
                        error={errors?.description || null}
                        placeholder="description"
                    />
                    <Input
                        label="price"
                        type="number"
                        value={product.price}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(event) =>
                            setProduct({
                                ...product,
                                price: event.target.value,
                            })
                        }
                        error={errors?.price || null}
                        placeholder="price"
                    />
                    <Input
                        label="quantity"
                        type="number"
                        value={product.quantity}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        onChange={(event) =>
                            setProduct({
                                ...product,
                                quantity: event.target.value,
                            })
                        }
                        error={errors?.quantity || null}
                        placeholder="quantity"
                    />
                    <div>
                        <label
                            htmlFor="tags"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Select tags
                        </label>
                        <Select
                            isMulti
                            options={suggestions}
                            value={product.tags}
                            onChange={handleTagChange}
                            styles={{
                                control: (styles) => ({
                                    ...styles,
                                    borderRadius: "0.375rem",
                                    border: "1px solid #D1D5DB",
                                }),
                                multiValueLabel: (styles) => ({
                                    ...styles,
                                    color: "white",
                                }),
                                multiValue: (styles) => ({
                                    ...styles,
                                    borderRadius: "0.375rem",
                                    backgroundColor: "#4f46e5",
                                    color: "white",
                                    margin: "2px",
                                    padding: "2px 4px",
                                }),
                            }}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="countries"
                            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                            Select an option
                        </label>
                        <select
                            value={product.category_id}
                            onChange={(event) =>
                                setProduct({
                                    ...product,
                                    category_id: event.target.value,
                                })
                            }
                            id="countries"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        >
                            <option selected>Choose a country</option>
                            {categories &&
                                categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <Input
                        label="images"
                        type="file"
                        name="file"
                        multiple={true}
                        error={errors?.images || null}
                        onChange={handleFileUpload}
                        style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
                    />
                    <div
                        className="flex gap-2 flex-wrap w-full"
                        style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
                    >
                        {temporaryImages &&
                            temporaryImages.map((image) => (
                                <div
                                    key={image.id ?? image.url}
                                    className="image-container"
                                >
                                    <img
                                        className="w-14 h-14"
                                        src={image.url}
                                        alt="display"
                                    />
                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={() => handleRemoveImage(image)}
                                        className="bg-red-600 text-white px-1 mt-1 rounded disabled:bg-red-300 disabled:cursor-not-allowed"
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                    </div>
                    <div
                        style={{
                            gridColumnStart: "1",
                            gridColumnEnd: "3",
                        }}
                    >
                        <div>
                            <h3 className="text-lg font-semibold mb-2 w-full">
                                Product Options
                            </h3>
                            <input
                                type="text"
                                className="bg-gray-50 focus:outline-none border-2
                                          focus:border-indigo-600 text-gray-900 text-sm rounded-lg block w-full p-2.5
                                            border-grey-300 placeholder-gray-400 dark:text-white mb-2"
                                ref={attri}
                                placeholder="attribute name"
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    handleAddAttribute(attri.current.value)
                                }
                                className="group mb-2 disabled:cursor-not-allowed disabled:!bg-indigo-400 relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Add Attribute
                            </button>
                        </div>
                        <div
                            className="flex gap-2"
                            style={{
                                gridColumnStart: "1",
                                gridColumnEnd: "3",
                            }}
                        >
                            {attributes &&
                                attributes.map((attribute, index) => (
                                    <div key={index}>
                                        <div className="border border-indigo-500 rounded p-2 text-indigo-500">
                                            {attribute.name}
                                        </div>
                                        <div className="flex gap-2 m-2">
                                            {attribute.options &&
                                                attribute.options.map(
                                                    (option, optionIndex) => (
                                                        <div
                                                            className="border border-blue-500 rounded p-2 text-blue-500"
                                                            key={optionIndex}
                                                        >
                                                            {option}
                                                        </div>
                                                    )
                                                )}
                                            <input
                                                type="text"
                                                value={optionsInput}
                                                onChange={(e) =>
                                                    setOptionsInput(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Enter option"
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleAddOption(
                                                    index,
                                                    optionsInput
                                                );
                                                setOptionsInput("");
                                            }}
                                            clasfsName="group disabled:cursor-not-allowed disabled:!bg-indigo-400 relative py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            Add Option
                                        </button>
                                    </div>
                                ))}
                        </div>
                        {varients && (
                            <>
                                <div className="flex flex-wrap gap-2 w-full">
                                    {varients.map((item, index) => (
                                        <div className="shadow p-2 ">
                                            <Input
                                                label="price"
                                                value={item.price}
                                            />
                                            <Input
                                                label="quantity"
                                                value={item.quantity}
                                            />
                                            {item.options.map((option) => (
                                                <p>
                                                    {option.name} :{" "}
                                                    {option.value}
                                                </p>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    {progress !== 0 && (
                        <div
                            className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700"
                            style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
                        >
                            <div
                                className="bg-indigo-600 h-2.5 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    )}
                    <button
                        disabled={processing || progress !== 0}
                        className="group !bg-indigo-600 disabled:cursor-not-allowed
             disabled:bg-indigo-400 relative py-2 px-4 border border-transparent
              text-sm font-medium rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        type="submit"
                        style={{ gridColumnStart: "1", gridColumnEnd: "3" }}
                    >
                        {processing || progress !== 0
                            ? "Updating..."
                            : "Update Product"}
                    </button>
                </form>
            )}
        </>
    );
}
