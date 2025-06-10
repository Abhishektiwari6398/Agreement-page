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
        <h2 className="text-xl font-semibold mb-2 border-b pb-1 border-gray-300">
            {title}
        </h2>
        <div className="text-white space-y-2 text-justify">{children}</div>
    </div>
);

const SignatureSection = ({ name, designation, signature, date }) => {

    const base64Date = Buffer.from(date).toString("base64");

    return (
        <div className="space-y-2">
            <p>
                <span className="font-semibold">Name:</span> {name ? name : "Not Signed Yet"}
            </p>
            <p>
                <span className="font-semibold">Designation:</span> {designation ? designation : "Not Signed Yet"}
            </p>
            <p>
                <span className="font-semibold">Signature:</span>
            </p>
            {signature ? (
                <img src={signature} className="h-14" alt="signature" />
            ) : (
                <p className="text-black">No signature uploaded</p>
            )}
            <p>
                <span className="font-semibold">Date: </span> {base64Date}
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
                window.location.reload();
            }
        } catch (error) {
            console.error("Submission failed:", error.response?.data || error);
            window.alert(`Failed to submit: ${error.response?.data?.error || "Please try again."}`);
        }
        setIsModalOpen(false);
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
        <div className="max-w-5xl mx-auto p-4 py-28 shadow rounded-lg bg-red-50">
            <h1 className="text-2xl font-bold text-center mb-6 text-black">
                INTERNSHIP AGREEMENT AND NON-DISCLOSURE AGREEMENT (NDA)
            </h1>
            <p className="text-[#000000] mb-4">
                This Agreement is made and entered into as of <strong>06/10/2025</strong> by and
                between:
            </p>
            <AgreementSection title="1. INTERNSHIP DETAILS"></AgreementSection>

            <AgreementSection title="1.1 Position">
                <p className="text-[#000000]">
                    Intern agrees to participate in a 3-month, unpaid internship program in the domain of Python,
                    Artificial Intelligence, Machine Learning, and Deep Learning.
                </p>
            </AgreementSection>

            <AgreementSection title="1.2 Duration">
                <p className="text-[#000000]">
                    Start Date: [Start Date] <br />
                    End Date: [End Date] <br />
                    The internship lasts exactly 3 months unless terminated earlier.
                </p>
            </AgreementSection>
            <AgreementSection title="1.3 Nature of Internship">
                <p className="text-[#000000]">
                    This internship is strictly educational and unpaid. No employer-employee relationship exists.
                    The purpose is skill enhancement, practical exposure, and learning through real-world
                    projects.
                </p>
            </AgreementSection>
            <AgreementSection title="2. DUTIES AND EXPECTATIONS">
                <ul className="list-disc list-inside text-[#000000]">
                    <li>Contribute to live and internal projects involving Python, AI/ML/DL.</li>
                    <li>Attend virtual meetings, submit tasks, and participate in reviews.</li>
                    <li>Maintain professional conduct and confidentiality.</li>
                    <li>Weekly progress updates and final submission are mandatory.</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="3. BENEFITS TO INTERN">
                <p className="text-[#000000]">Upon successful completion, the intern will receive:</p>
                <ul className="list-disc list-inside text-[#000000]">
                    <li>Internship Certificate</li>
                    <li>Letter of Recommendation (subject to performance)</li>
                    <li>Letter of Experience</li>
                    <li>Job Offer Opportunity (only if performance is exceptional)</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="4. NON-DISCLOSURE AGREEMENT (NDA)"></AgreementSection>

            <AgreementSection title="4.1 Confidential Information">
                <p className="text-[#000000]">
                    Intern agrees not to disclose any proprietary, confidential, or sensitive data related to:
                </p>
                <ul className="list-disc list-inside text-[#000000]">
                    <li>Codebase, source files, algorithms, datasets</li>
                    <li>Research methodologies or tech architecture</li>
                    <li>Any unpublished projects or business strategies</li>
                    <li>Client information or third-party tools used</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="4.2 Ownership">
                <p className="text-[#000000]">
                    All work, code, inventions, designs, and intellectual property created during the internship
                    shall be the exclusive property of the Company.
                </p>
            </AgreementSection>

            <AgreementSection title="4.3 Non-Use and Non-Disclosure">
                <p className="text-[#000000]">
                    Intern shall not use Confidential Information for personal benefit or disclose it to third parties.
                    This clause survives even after the termination of the internship.
                </p>
            </AgreementSection>

            <AgreementSection title="5. TERMINATION">
                <p className="text-[#000000]">This Agreement may be terminated:</p>
                <ul className="list-disc list-inside text-[#000000]">
                    <li>By either party with 7 days' written notice.</li>
                    <li>Immediately by the Company for misconduct, violation of confidentiality, or failure to perform.</li>
                    <li>Upon intern's request due to academic/emergency obligations (subject to formal notice).</li>
                </ul>
            </AgreementSection>

            <AgreementSection title="6. NO COMPENSATION">
                <p className="text-[#000000]">
                    The Intern understands and agrees that this internship is voluntary and unpaid. No wages,
                    stipends, or financial compensation shall be provided during the 3-month internship period,
                    except for potential performance-based rewards that may be granted at the sole discretion
                    of the Company in recognition of exceptional contributions.
                </p>
            </AgreementSection>

            <AgreementSection title="7. GOVERNING LAW">
                <p className="text-[#000000]">
                    This Agreement shall be governed by and construed in accordance with the laws of India.
                    Any disputes shall be resolved in courts located in [Your Jurisdiction – e.g., Delhi].
                </p>
            </AgreementSection>

            <AgreementSection title="8. ENTIRE AGREEMENT">
                <p className="text-[#000000]">
                    This document constitutes the complete agreement between the parties. Any amendments
                    must be in writing and signed by both parties.
                </p>
            </AgreementSection>

            <div className="grid md:grid-cols-2 gap-6 mt-10">
                <div>
                    <AgreementSection title="9. SIGNATURES"></AgreementSection>
                    <SignatureSection
                        name={partnerData.name}
                        designation={partnerData.designation}
                        signature={partnerData.signatureURL}
                        date={partnerData.date}
                    />
                    {len.length <= 0 && (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-sm font-dm cursor-pointer hover:scale-110 transition-all font-semibold text-black rounded-4xl my-2 bg-white px-4 py-1.5"
                        >
                            Fill Details
                        </button>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-2xl bg-opacity-50">
                    <form
                        onSubmit={handleSubmit}
                        className="p-6 rounded-lg max-w-md w-full space-y-4 bg-gray-900 text-white"
                    >
                        <h2 className="text-xl font-semibold mb-2">
                            Enter Signatory Details
                        </h2>
                        <div>
                            <label className="block font-medium mb-1">Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                value={partnerData.name}
                                onChange={handleInputChange}
                                className="w-full p-2 border-b border-gray-300 outline-none rounded bg-gray-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Designation</label>
                            <input
                                name="designation"
                                type="text"
                                required
                                value={partnerData.designation}
                                onChange={handleInputChange}
                                className="w-full p-2 border-b border-gray-300 outline-none rounded bg-gray-800 text-white"
                            />
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Signature Image</label>
                            <input
                                type="file"
                                accept="image/png"
                                onChange={handleSignatureUpload}
                                required
                                className="w-full p-2 border-b border-gray-300 outline-none rounded text-white"
                            />
                            {partnerData.signatureURL && (
                                <img
                                    src={partnerData.signatureURL}
                                    alt="Preview"
                                    className="h-16 mt-2"
                                />
                            )}
                        </div>
                        <div>
                            <label className="block font-medium mb-1">Date</label>
                            <input
                                name="date"
                                type="text"
                                required
                                value={partnerData.date}
                                onChange={handleInputChange}
                                className="w-full p-2 border-b border-gray-300 outline-none rounded bg-gray-800 text-white"
                            />
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded cursor-pointer bg-gray-700 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-white text-black cursor-pointer rounded"
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