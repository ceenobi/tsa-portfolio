import { useNavigate } from "react-router";
import { Button } from "../ui/button";

export default function AddProject() {
  const navigate = useNavigate();
  return (
    <Button
      onClick={() => navigate("/dashboard/portfolio/new")}
      className="bg-mainBlue hover:bg-mainBlue/90 text-white w-full max-w-38.5 h-10"
      size="lg"
    >
      Add New Project
    </Button>
  );
}
