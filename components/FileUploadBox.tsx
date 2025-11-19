import { fileUploads } from "@/Actions/server";
import { AlertCircle, CheckCircle, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import ShowParsedData from "./ShowParsedData";

type ParsedDataType = {
    case_id?: string;
    output?: {
        classification: string;
        confidence_score: number;
        fraud_type: string;
        recommended_action: string;
        risk_indicators: string[];
        extracted_entities: { [key: string]: unknown };
        ai_report: string;
    };
};

type FileUploadResult = {
    file_content?: string;
    file_url?: string;
};

export default function FileUploadBox() {
    const inputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("");
    const [fileContent, setFileContent] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<null | 'success' | 'error'>(null);

    const [parsedData, setParsedData] = useState<ParsedDataType>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false); // Loader for analysis


    async function action(formData: FormData) {
        setFileName("");
        setIsAnalyzing(true); // Start loader for analysis
        try {
            const result = await fileUploads(formData, fileContent);
            console.log('File upload result:', result);
            const fileEntry = formData.get('file');
            if (fileEntry && typeof fileEntry === 'object' && 'name' in fileEntry) {
                setFileName((fileEntry as File).name);
            }

            const fileData = async (result: FileUploadResult) => {

                try {
                    const response = await fetch("https://n8n.bestplanettechnology.com/webhook/file-upload-analyse", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ "text": result.file_content || "", "url": result.file_url || "" }),
                    })
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    console.log('File data processed:', data);
                    return data;


                } catch (error) {
                    console.error('Error processing file data:', error);
                    setUploadStatus('error');
                    return {};

                }
            }
            const resp = await fileData(result);
            setParsedData(resp);
            setUploadStatus('success');
            console.log('Upload successful:', result);

        } catch (error) {
            const fileEntry = formData.get('file');
            if (fileEntry && typeof fileEntry === 'object' && 'name' in fileEntry) {
                setFileName((fileEntry as File).name);
            }
            setUploadStatus('error');
            console.error('Upload failed:', error);
        } finally {
            setIsUploading(false);
            setIsAnalyzing(false); // Stop loader for analysis
        }
    }

    const getStatusIcon = () => {
        if (isUploading) return <Loader2 className="w-4 h-4 animate-spin" />;
        if (uploadStatus === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />;
        if (uploadStatus === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
        return <Upload className="w-4 h-4" />;
    };

    const getStatusColor = () => {
        if (uploadStatus === 'success') return 'bg-green-50 border-green-200 text-green-800';
        if (uploadStatus === 'error') return 'bg-red-50 border-red-200 text-red-800';
        return 'bg-blue-50 border-blue-200 text-blue-800';
    };

    return (
        <div className="flex flex-col mt-5 items-center justify-center p-8 gap-5 bg-white rounded-xl shadow-lg border w-full max-w-4xl mx-auto">
            <form
                action={action}
                className="w-full flex flex-col items-center justify-center"
                onSubmit={() => { setIsUploading(true); setUploadStatus(null) }}
            >
                <label
                    htmlFor="file-upload"
                    className="w-full flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer transition hover:bg-blue-50"
                    aria-label="Upload file"
                >
                    <Upload className="w-8 h-8 text-blue-500 mb-2" />
                    <span className="text-lg font-medium text-blue-700">
                        {isUploading ? "Uploading..." : "Click to select a file"}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">Supported: .csv, .xlsx, .txt</span>
                    <input
                        type="file"
                        id="file-upload"
                        ref={inputRef}
                        className="hidden"
                        name="file"
                        required
                        disabled={isUploading}
                        title="Upload file"
                        accept=".txt"
                        onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setFileName(file.name);
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                    setFileContent(event.target?.result as string);
                                };
                                reader.readAsText(file, 'UTF-8');
                            }
                        }}
                    />
                </label>
                <button
                    type="submit"
                    className={"mt-4 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50" + (isUploading ? " cursor-not-allowed" : " cursor-pointer")}
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading" : "Upload"}
                </button>
            </form>
            {fileName && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded border text-sm ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span>{fileName}</span>
                    {uploadStatus === 'success' && <span className="text-xs">(Uploaded)</span>}
                    {uploadStatus === 'error' && <span className="text-xs">(Failed)</span>}
                </div>
            )}


<div>
                {isAnalyzing && (
                    <div className="flex flex-col items-center justify-center mt-4 p-4 bg-blue-50 rounded-lg shadow-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500 mb-2" />
                        <span className="text-blue-700">Analyzing file, please wait...</span>
                    </div>
                )}
                {!isAnalyzing && parsedData && parsedData?.output && (
                    <ShowParsedData parsedData={parsedData} />
                )}
            </div>


            <div>
                {fileContent && (
                    <div
                        className="flex flex-col mt-4 p-4 bg-gray-50 rounded-lg shadow-sm"
                        style={{
                            maxHeight: "60vh", // Adjust as needed, e.g., 80vh for more height
                            overflowY: "auto",
                            minHeight: "200px"
                        }}
                    >
                        <h3>File Content:</h3>
                        <pre className="whitespace-pre-wrap break-all">{fileContent}</pre>
                    </div>
                )}
            </div>

        </div>
    );
}
