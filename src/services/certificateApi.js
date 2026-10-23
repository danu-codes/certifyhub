
import axios from "axios";
import * as XLSX from "xlsx";

const API_URL = "http://localhost:8080/api/certificates";

const api = axios.create({
    baseURL: API_URL,
    timeout: 120000,
});

function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function getApiError(error) {
    const responseData = error.response?.data;

    if (responseData instanceof Blob) {
        try {
            const text = await responseData.text();
            const data = JSON.parse(text);

            return new Error(data.error || "Request failed.");
        } catch {
            return new Error("Server could not process the request.");
        }
    }

    return new Error(
        responseData?.error ||
        error.message ||
        "Unable to connect to Spring Boot."
    );
}

export async function checkBackendHealth() {
    const response = await api.get("/health");
    return response.data;
}

export async function generateSingleAPI({
    templateFile,
    name,
    settings,
}) {
    const formData = new FormData();

    if (templateFile) {
        formData.append("template", templateFile);
    }

    formData.append("name", name);
    formData.append("settings", JSON.stringify(settings));

    try {
        const response = await api.post("/preview", formData, {
            responseType: "blob",
        });

        saveBlob(response.data, "certificate.pdf");
    } catch (error) {
        throw await getApiError(error);
    }
}

export async function generateBulkAPI({
    templateFile,
    participants,
    settings,
}) {
    // Create an Excel file from the CURRENT participant list.
    // This includes names added or edited in the React UI.
    const rows = [
        ["Name"],
        ...participants.map((person) => [person.name]),
    ];

    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Participants"
    );

    const excelData = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const excelBlob = new Blob([excelData], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const formData = new FormData();

    formData.append(
        "excel",
        excelBlob,
        "participants.xlsx"
    );

    if (templateFile) {
        formData.append("template", templateFile);
    }

    formData.append("settings", JSON.stringify(settings));

    try {
        const response = await api.post("/generate", formData, {
            responseType: "blob",
        });

        saveBlob(
            response.data,
            "CertifyHub_Certificates.zip"
        );
    } catch (error) {
        throw await getApiError(error);
    }
}
