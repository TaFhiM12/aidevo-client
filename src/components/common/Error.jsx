import { AlertCircle, Home } from "lucide-react";
import { Link } from "react-router";

const Error = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <AlertCircle size={64} className="text-error" />
          <h2 className="card-title text-2xl">Oops!</h2>
          <p className="text-base-content/70">
            Something went wrong. Please try again later.
          </p>
          <div className="card-actions mt-4">
            <Link to="/" className="btn btn-primary">
              <Home size={20} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Error;