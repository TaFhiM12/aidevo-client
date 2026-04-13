import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../../utils/uploadToCloudinary";
import CreateEventForm from '../../../components/forms/CreateEventForm';
import API from "../../../utils/api";

const EventCreation = () => {
  const handleCreateEvent = async (formData) => {
    const submitToast = toast.loading("Creating event...");

    try {
      let imageUrl = "";

      if (formData.cover) {
        imageUrl = await uploadToCloudinary(formData.cover);
      }

      const eventData = {
        ...formData,
        cover: imageUrl,
      };

      // const res = await axios.post("http://localhost:3000/events", eventData);
      const res = await API.post("/events", eventData);

      if (res.success || res.data?.success) {
        toast.success("Event created successfully", { id: submitToast });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong", {
        id: submitToast,
      });
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10 px-4">
      <div className="mx-auto">
        <CreateEventForm onSubmit={handleCreateEvent} />
      </div>
    </div>
  );
};

export default EventCreation;
