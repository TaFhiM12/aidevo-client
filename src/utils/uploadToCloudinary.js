export const uploadToCloudinary = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "aidevo");
    formData.append("cloud_name", "dsv8odb2w");

    const res = await fetch("https://api.cloudinary.com/v1_1/dsv8odb2w/image/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");

    return data.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  }
};

export const uploadChatAttachment = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "aidevo");
    formData.append("cloud_name", "dsv8odb2w");

    const res = await fetch("https://api.cloudinary.com/v1_1/dsv8odb2w/auto/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "Upload failed");

    const inferredType = file.type?.startsWith("image/") ? "image" : "file";

    return {
      url: data.secure_url,
      type: inferredType,
      name: file.name || data.original_filename || "attachment",
      size: file.size || 0,
    };
  } catch (err) {
    console.error("Chat attachment upload error:", err);
    return null;
  }
};
