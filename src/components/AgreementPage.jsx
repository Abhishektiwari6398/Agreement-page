"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

const uploadToCloudinary = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post("/api/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.url;
    } catch (error) {
        console.error("Upload failed:", error.response?.data || error);
        return null;
    }
};

const AgreementSection = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 border-b pb-1 border-gray-300 text-gray-800">
            {title}
        </h2>
        <div className="text-gray-700 space-y-2 text-justify">{children}</div>
    </div>
);

const SignatureSection = ({ name, designation, signature, date }) => {
    // Format date to Base64 as requested
    const formatDateToBase64 = (dateStr) => {
        try {
            if (!dateStr) return btoa("Not Signed Yet");
            // Convert date string to Base64
            return btoa(dateStr);
        } catch (error) {
            console.error("Error encoding date to Base64:", error);
            return btoa("Invalid Date");
        }
    };

    return (
        <div className="space-y-2 p-4 border border-gray-300 rounded-lg bg-white">
            <p className="text-gray-800">
                <span className="font-semibold">Name:</span> {name || "Not Signed Yet"}
            </p>
            <p className="text-gray-800">
                <span className="font-semibold">Designation:</span> {designation || "Not Signed Yet"}
            </p>
            <p className="text-gray-800">
                <span className="font-semibold">Signature:</span>
            </p>
            {signature ? (
                <img src={signature} className="h-14 border border-gray-200" alt="signature" />
            ) : (
                <p className="text-gray-500">No signature uploaded</p>
            )}
            <p className="text-gray-800">
                <span className="font-semibold">Date: </span> {formatDateToBase64(date)}
            </p>
        </div>
    );
};

export default function AgreementPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [len, setLen] = useState([]);
    const [partnerData, setPartnerData] = useState({
        name: "",
        designation: "",
        signature: null,
        signatureURL: "",
        date: "06/10/2025",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPartnerData({ ...partnerData, [name]: value });
    };

    const handleSignatureUpload = async (e) => {
        setLoading(true);
        const file = e.target.files[0];
        if (!file) {
            window.alert("No file selected.");
            setLoading(false);
            return;
        }
        if (file.type !== "image/png") {
            window.alert("Please upload a PNG image.");
            setLoading(false);
            return;
        }
        const url = await uploadToCloudinary(file);
        if (url) {
            setPartnerData({
                ...partnerData,
                signature: file,
                signatureURL: url,
            });
        } else {
            window.alert("Failed to upload signature. Please try again.");
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!partnerData.name || !partnerData.designation || !partnerData.signatureURL || !partnerData.date) {
            window.alert("Please fill all fields and upload a signature.");
            return;
        }
        setLoading(true);
        try {
            const res = await axios.post("/api/agreement", {
                name: partnerData.name,
                designation: partnerData.designation,
                signature: partnerData.signatureURL,
                date: partnerData.date,
            });
            if (res.status === 201) {
                window.alert("SUCCESS!");
                // Instead of reload, update state directly
                setLen([{
                    name: partnerData.name,
                    designation: partnerData.designation,
                    signature: partnerData.signatureURL,
                    date: partnerData.date
                }]);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error("Submission failed:", error.response?.data || error);
            window.alert(`Failed to submit: ${error.response?.data?.error || "Please try again."}`);
        }
        setLoading(false);
    };

    const getData = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get("/api/agreement");
            setLen(data);
            if (data.length > 0) {
                setPartnerData((prev) => ({
                    ...prev,
                    name: data[0].name,
                    designation: data[0].designation,
                    signatureURL: data[0].signature,
                    date: data[0].date || "06/10/2025",
                }));
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="max-w-5xl mx-auto p-6 py-8 shadow-lg rounded-lg bg-white min-h-screen">
            {/* Fix: Improved heading visibility */}
            <div className="text-center mb-8 p-4  rounded-lg">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    INTERNSHIP AGREEMENT AND NON-DISCLOSURE AGREEMENT (NDA)
                </h1>
                <p className="text-gray-600 text-lg">
                    This Agreement is made and entered into as of <strong>06/10/2025</strong>
                </p>
            </div>

            <AgreementSection title="1. INTERNS DETAILS">
                <p className="text-gray-700">
                    This section outlines the intern's basic information and agreement to the terms below.
                </p>
            </AgreementSection>

            <AgreementSection title="1.1 Position">
                <p className="text-gray-700">
                    Intern agrees to participate in a 3-month, unpaid internship program in the domain of Python,
                    Artificial Intelligence, Machine Learning, and Deep Learning.
                </p>
            </AgreementSection>

            <AgreementSection title="1.2 Duration">
                <p className="text-gray-700">
                    Start Date: [Start Date] <br />
                    End Date: [End Date] <br />
                    The internship lasts exactly 3 months unless terminated earlier.
                </p>
            </AgreementSection>

            <AgreementSection title="1.3 Nature of Internship">
                <p className="text-gray-700">
                    This internship is strictly educational and unpaid. No employer-employee relationship exists.
                    The purpose is skill enhancement, practical exposure, and learning through real-world
                    projects.
                </p>
            </AgreementSection>

            <AgreementSection title="2. DUTIES AND EXPECTATIONS">
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Contribute to live and internal projects involving Python, AI/ML/DL.</li>
                    <li>Attend virtual meetings, submit tasks, and participate in reviews.</li>
                    <li>Maintain professional conduct and confidentiality.</li>
                    <li>Weekly progress updates and final submission are mandatory.</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="3. BENEFITS TO INTERN">
                <p className="text-gray-700">Upon successful completion, the intern will receive:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Internship Certificate</li>
                    <li>Letter of Recommendation (subject to performance)</li>
                    <li>Letter of Experience</li>
                    <li>Job Offer Opportunity (only if performance is exceptional)</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="4. NON-DISCLOSURE AGREEMENT (NDA)">
                <p className="text-gray-700">
                    The following terms govern confidentiality and intellectual property rights.
                </p>
            </AgreementSection>

            <AgreementSection title="4.1 Confidential Information">
                <p className="text-gray-700">
                    Intern agrees not to disclose any proprietary, confidential, or sensitive data related to:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Codebase, source files, algorithms, datasets</li>
                    <li>Research methodologies or tech architecture</li>
                    <li>Any unpublished projects or business strategies</li>
                    <li>Client information or third-party tools used</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="4.2 Ownership">
                <p className="text-gray-700">
                    All work, code, inventions, designs, and intellectual property created during the internship
                    shall be the exclusive property of the Company.
                </p>
            </AgreementSection>

            <AgreementSection title="4.3 Non-Use and Non-Disclosure">
                <p className="text-gray-700">
                    Intern shall not use Confidential Information for personal benefit or disclose it to third parties.
                    This clause survives even after the termination of the internship.
                </p>
            </AgreementSection>

            <AgreementSection title="5. TERMINATION">
                <p className="text-gray-700">This Agreement may be terminated:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>By either party with 7 days' written notice.</li>
                    <li>Immediately by the Company for misconduct, violation of confidentiality, or failure to perform.</li>
                    <li>Upon intern's request due to academic/emergency obligations (subject to formal notice).</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="6. NO COMPENSATION">
                <p className="text-gray-700">
                    The Intern understands and agrees that this internship is voluntary and unpaid. No wages,
                    stipends, or financial compensation shall be provided during the 3-month internship period,
                    except for potential performance-based rewards that may be granted at the sole discretion
                    of the Company in recognition of exceptional contributions.
                </p>
            </AgreementSection>

            <AgreementSection title="7. GOVERNING LAW">
                <p className="text-gray-700">
                    This Agreement shall be governed by and construed in accordance with the laws of India.
                    Any disputes shall be resolved in courts located in [Your Jurisdiction – e.g., Delhi].
                </p>
            </AgreementSection>

            <AgreementSection title="8. ENTIRE AGREEMENT">
                <p className="text-gray-700">
                    This document constitutes the complete agreement between the parties. Any amendments
                    must be in writing and signed by both parties.
                </p>
            </AgreementSection>

            <div className="mt-10">
                <AgreementSection title="9. SIGNATURES">
                    <div className=" p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Company Representative</h3>
                        <SignatureSection
                            name={partnerData.name}
                            designation={partnerData.designation}
                            signature={partnerData.signatureURL}
                            date={partnerData.date}
                        />
                        {len.length <= 0 && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Fill Details"}
                            </button>
                        )}
                    </div>
                </AgreementSection>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 rounded-lg max-w-md w-full mx-4 space-y-4 bg-white shadow-2xl"
                    >
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">
                            Enter Signatory Details
                        </h2>
                        <div>
                            <label className="block font-medium mb-1 text-gray-700">Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={partnerData.name}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 outline-none rounded-lg bg-white text-gray-800 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-gray-700">Designation</label>
                            <input
                                name="designation"
                                type="text"
                                required
                                value={partnerData.designation}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 outline-none rounded-lg bg-white text-gray-800 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-gray-700">Signature Image (PNG only)</label>
                            <input
                                type="file"
                                accept="image/png"
                                onChange={handleSignatureUpload}
                                required
                                className="w-full p-3 border border-gray-300 outline-none rounded-lg text-gray-800"
                            />
                            {partnerData.signatureURL && (
                                <img
                                    src={partnerData.signatureURL}
                                    alt="Preview"
                                    className="h-16 mt-2 border border-gray-200"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1 text-gray-700">Date</label>
                            <input
                                name="date"
                                type="text"
                                required
                                value={partnerData.date}
                                onChange={handleInputChange}
                                className="w-full p-3 border border-gray-300 outline-none rounded-lg bg-white text-gray-800 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
