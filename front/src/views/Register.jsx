import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/auth";
import Cookies from "js-cookie";
import createAxiosInstance from "../axios";

const Register = () => {
  const authContext = useContext(AuthContext);
  const axios = createAxiosInstance(AuthContext);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_conf: "",
  });

  const [errors, setErrors] = useState({});

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setProcessing(true);
      if (!Cookies.get("XSRF-TOKEN")) {
        await axios.get("/sanctum/csrf-cookie", {
          withCredentials: "include",
        });
      }
      await axios.post("/register", form);
      await authContext.fetchUser();
      navigate("/user/verify");
    } catch (error) {
      if (error.response.status === 422) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const error = (fieldName) => {
    const fieldErrors = errors[fieldName];

    if (fieldErrors && fieldErrors.length > 0) {
      console.log("fieldErrors[0] :>> ", fieldErrors[0]);
      return <span className="text-red-600">{fieldErrors[0]}</span>;
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            register
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div>
            <label htmlFor="email" className="block text-gray-700">
              name
            </label>
            <input
              id="name"
              name="name"
              type="name"
              autoComplete="name"
              className="mt-1 p-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              onChange={handleInputChange}
            />
            {errors && error("name")}
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 p-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              onChange={handleInputChange}
            />
            {errors && error("email")}
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="password"
              className="mt-1 p-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              onChange={handleInputChange}
            />
            {errors && error("password")}
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700">
              Password confirm
            </label>
            <input
              id="password_conf"
              name="password_conf"
              type="password"
              autoComplete="current-password"
              className="mt-1 p-2 block w-full shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 rounded-md"
              onChange={handleInputChange}
            />
            {errors && error("password_conf")}
          </div>
          <div>
            <Link className="text-indigo-600" to="/login">
              already have an account?
            </Link>
          </div>
          <div>
            <button
              disabled={processing}
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border 
        ${
          processing === true
            ? "bg-gray-300 cursor-not-allowed"
            : "border-transparent text-sm font-medium rounded-md text-white !bg-indigo-600 hover:!bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        }`}
            >
              register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
