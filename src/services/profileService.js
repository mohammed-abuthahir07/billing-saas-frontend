import api from "./api";

// GET Profile
export const getProfile = async () => {
    const response = await api.get("/profile");
    return response.data;
};

// UPDATE Profile
export const updateProfile = async (userData) => {
    const response = await api.put("/profile", userData);
    return response.data;
};

export const uploadProfileImage = async (file) => {
    const formData = new FormData();

    formData.append("image", file);

    const response = await api.post(
        "/profile/upload-image",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );
    return response.data;
};