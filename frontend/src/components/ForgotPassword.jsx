import React from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  return (
    <div className="flex items-center justify-center">
      <div className="p-10 m-10 sm:p-15 sm:m-5 w-96 bg-white rounded-lg shadow">
        <h1 className="font-semibold w-full text-3xl mb-7 text-center">Forgot Password</h1>
        <div className="rounded w-full">
          <label htmlFor="email">
            <span className="LabelText">Email</span>
            <input
              className="Input"
              type="text"
              value=""
              id="email"
            />
          </label>
          <button className="Button" type="submit">
            Submit
          </button>
          <p className="text-sm font-light text-gray-500 mt-5">
            <span className="float-left text-sm font-medium text-primary-600 mr-10"> Do you have an account?</span>
            <Link to="/login" className="text-sm font-medium text-primary-600 hover:underline text-blue-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
