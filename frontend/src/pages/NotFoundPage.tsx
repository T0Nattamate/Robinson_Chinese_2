import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="font-poppins bg-gray-200 w-full h-screen flex flex-col justify-center items-center">
      <h4 className="text-9xl text-black font-bold">404</h4>
      <h1 className="text-3xl font-semibold text-black">
        Page not found
      </h1>
      <p className="w-[90%] md:w-96 text-center mt-5 text-[var(--secondary)]">
        The page you are looking for doesn't exit or an other error occured,go
        back to home page
      </p>

      <Link
        className="button-outlined mt-5 text-[var(--dark-green)] border-[var(--dark-green)] hover:border-slate-500 hover:text-slate-500"
        to="/"
      >
        Go to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
