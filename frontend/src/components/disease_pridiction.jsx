// import React, { useState } from 'react';
// import axios from 'axios'; // Using axios for consistency with your backend examples
// import ReactMarkdown from 'react-markdown'; // <-- 1. IMPORT THIS
// import { Leaf, UploadCloud, X, LoaderCircle, Lightbulb, AlertCircle } from "lucide-react";

// export function Prediction() {
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [preview, setPreview] = useState(null);
//     const [isDragging, setIsDragging] = useState(false);
//     const [isLoading, setIsLoading] = useState(false);
//     const [result, setResult] = useState(""); // <-- 2. RESULT IS NOW A STRING
//     const API_BASE_URL = 'http://localhost:3000';

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (file && file.type.startsWith("image/")) {
//             setSelectedFile(file);
//             setPreview(URL.createObjectURL(file));
//             setResult(""); // Clear previous results
//         }
//     };

//     const clearSelection = () => {
//         setSelectedFile(null);
//         setPreview(null);
//         setResult("");
//     };

//     const handleDragOver = (e) => {
//         e.preventDefault(); 
//         setIsDragging(true);
//     };

//     const handleDragLeave = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//     };

//     const handleDrop = (e) => {
//         e.preventDefault();
//         setIsDragging(false);
//         const file = e.dataTransfer.files[0];
//         if (file && file.type.startsWith("image/")) {
//             setSelectedFile(file);
//             setPreview(URL.createObjectURL(file));
//             setResult("");
//         }
//     };
    
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!selectedFile) {
//             alert("Please select a file to predict.");
//             return;
//         }
//         setIsLoading(true);
//         setResult("");

//         try {
//             const formData = new FormData();
//             formData.append('image', selectedFile);

//             // 3. POINT TO THE NEW, GEMINI-POWERED ENDPOINT
//             const response = await axios.post(`${API_BASE_URL}/api/v1/predict-disease-detailed`, formData, {
//                 headers: { 'Content-Type': 'multipart/form-data' },
//             });
            
//             // 4. GET THE 'advisory' TEXT FROM THE RESPONSE
//             if (response.data && response.data.advisory) {
//                 setResult(response.data.advisory);
//             } else {
//                  throw new Error('Invalid response format from server');
//             }

//         } catch (error) {
//             console.error('Prediction error:', error);
//             const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred.";
//             setResult(`# Analysis Failed\n\n**Error:** ${errorMessage}\n\nPlease try again with a clear, well-lit image of the plant leaf.`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // 5. THE OLD getRecommendation() FUNCTION IS NO LONGER NEEDED AND HAS BEEN REMOVED

//     return (
//         <form onSubmit={handleSubmit} className="text-center">
//             <h3 className="text-2xl font-bold text-gray-800 mb-4">Instant Disease Diagnosis & Advisory</h3>
//             <p className="text-gray-600 mb-6 max-w-xl mx-auto">
//                 Upload a clear photo of an affected leaf. Our AI will identify the disease and provide a detailed treatment and prevention plan.
//             </p>

//             {/* File Input & Dropzone (No changes needed here) */}
//             <div
//                 onDragOver={handleDragOver}
//                 onDragLeave={handleDragLeave}
//                 onDrop={handleDrop}
//                 className={`relative border-4 border-dashed rounded-2xl p-8 transition-colors ${
//                     isDragging ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-500'
//                 }`}
//             >
//                 {preview ? (
//                     <>
//                         <img src={preview} alt="Selected leaf" className="w-full h-48 object-contain mx-auto rounded-md" />
//                         <button type="button" onClick={clearSelection} className="absolute top-2 right-2 ..."> <X size={20} /> </button>
//                     </>
//                 ) : (
//                     <>
//                         <UploadCloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//                         <p className="text-gray-700 font-semibold mb-2">Drag & drop a file here or</p>
//                         <label htmlFor="file-upload" className="text-green-600 font-bold ..."> Choose a file </label>
//                     </>
//                 )}
//                 <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
//             </div>
            
//             {/* Submit Button (No changes needed here) */}
//              <button
//                 type="submit"
//                 disabled={!selectedFile || isLoading}
//                 className="w-full mt-6 bg-green-600 text-white font-bold ... "
//             >
//                 {isLoading ? ( <><LoaderCircle className="animate-spin mr-2" /> Analyzing...</> ) : ( <> <Lightbulb className="mr-2" /> Get AI Advisory</> )}
//             </button>
            
//             {/* 6. NEW AND IMPROVED RESULT DISPLAY */}
//             {result && (
//                 <div className="mt-8 text-left p-6 bg-gray-50 border border-gray-200 rounded-lg prose max-w-none">
//                     <ReactMarkdown>
//                         {result}
//                     </ReactMarkdown>
//                 </div>
//             )}
//         </form>
//     );
// }

import React, { useState } from 'react';
import axios from 'axios';
import { Leaf, UploadCloud, X, LoaderCircle, Lightbulb, AlertCircle, TestTube2, Sprout, Shield } from "lucide-react";

// A helper component to display each section of the advisory beautifully
const InfoSection = ({ icon, title, items }) => (
    <div className="mt-4">
        <h4 className="text-lg font-bold text-gray-800 flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
        </h4>
        <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    </div>
);

export function Prediction() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null); // Result will now be a JSON OBJECT
    const [error, setError] = useState(null);
    const API_BASE_URL = 'http://localhost:3000';

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null); // Clear previous results
            setError(null);
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setError(null);
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsLoading(true);
        setResult(null);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await axios.post(`${API_BASE_URL}/api/v1/predict-disease-detailed`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            if (response.data && response.data.advisory) {
                setResult(response.data.advisory); // Set the result to the JSON object
            } else {
                 throw new Error('Invalid response format from server');
            }

        } catch (error) {
            const errorMessage = error.response?.data?.error || error.message || "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Instant Disease Diagnosis & Advisory</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                Upload a clear photo of an affected leaf. Our AI will identify the disease and provide a detailed treatment and prevention plan.
            </p>

            {/* File Input & Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-4 border-dashed rounded-2xl p-8 transition-colors ${
                    isDragging ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-500'
                }`}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Selected leaf" className="w-full h-48 object-contain mx-auto rounded-md" />
                        <button type="button" onClick={clearSelection} className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"> <X size={20} /> </button>
                    </>
                ) : (
                    <>
                        <UploadCloud className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-semibold mb-2">Drag & drop a file here or</p>
                        <label htmlFor="file-upload" className="text-green-600 font-bold cursor-pointer hover:underline"> Choose a file </label>
                    </>
                )}
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" />
            </div>
            
            {/* Submit Button */}
             <button
                type="submit"
                disabled={!selectedFile || isLoading}
                className="w-full mt-6 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
                {isLoading ? ( <><LoaderCircle className="animate-spin mr-2" /> Analyzing...</> ) : ( <> <Lightbulb className="mr-2" /> Get AI Advisory</> )}
            </button>
            
            {/* NEW AND IMPROVED RESULT DISPLAY */}
            {error && (
                <div className="mt-8 text-left text-red-600 bg-red-100 p-4 rounded-lg">
                    <AlertCircle className="inline-block mr-2" /> <strong>Analysis Failed:</strong> {error}
                </div>
            )}

            {result && !isLoading && (
                <div className="mt-8 text-left p-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <h3 className="text-2xl font-bold text-green-700">{result.disease_name}</h3>
                    <p className="mt-2 text-gray-700 italic">{result.summary}</p>
                    
                    <InfoSection icon={<Leaf size={20} className="text-orange-500" />} title="Key Symptoms" items={result.symptoms} />
                    <InfoSection icon={<Sprout size={20} className="text-green-600" />} title="Organic Treatment" items={result.organic_treatment} />
                    <InfoSection icon={<TestTube2 size={20} className="text-blue-500" />} title="Chemical Treatment" items={result.chemical_treatment} />
                    <InfoSection icon={<Shield size={20} className="text-indigo-500" />} title="Prevention Tips" items={result.prevention_tips} />
                </div>
            )}
        </form>
    );
}