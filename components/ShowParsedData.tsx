import React from 'react'

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

const ShowParsedData = ({parsedData}: {parsedData: ParsedDataType}) => {
  return (
    <>
        <div>
                {parsedData && parsedData?.output && (
                    <div className="flex flex-col mt-4 p-4 bg-green-50 rounded-lg shadow-sm text-sm">
                        <h3 className="font-semibold text-green-800 mb-2">Parsed & Classified Data</h3>
                        <div className="mb-2"><span className="font-medium">Case ID:</span> {parsedData.case_id}</div>
                        <div className="mb-2"><span className="font-medium">Classification:</span> {parsedData.output.classification} <span className="ml-2 text-xs text-gray-500">(Confidence: {Math.round(parsedData.output.confidence_score * 100)}%)</span></div>
                        <div className="mb-2"><span className="font-medium">Fraud Type:</span> {parsedData.output.fraud_type}</div>
                        <div className="mb-2"><span className="font-medium">Recommended Action:</span> {parsedData.output.recommended_action}</div>
                        <div className="mb-2">
                            <span className="font-medium">Risk Indicators:</span>
                            <ul className="list-disc ml-6">
                                {parsedData?.output.risk_indicators.map((item: string, idx: number) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-2">
                            <span className="font-medium">Extracted Entities:</span>
                            <ul className="list-disc ml-6">
                                {Object.entries(parsedData?.output.extracted_entities).map(([key, value]: [string, unknown]) => (
<li key={key}>
    <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> 
    {(() => {
    // Check for a non-null object that is not an array
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return <pre className="ml-4 mt-1 bg-gray-100 p-2 rounded text-xs">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    // Check for an array
    if (Array.isArray(value)) {
      // If the array contains objects, pretty-print the whole array
      if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
        return <pre className="ml-4 mt-1 bg-gray-100 p-2 rounded text-xs">{JSON.stringify(value, null, 2)}</pre>;
      }
      // Otherwise, it's a simple array (of strings, numbers), so join it
      return value.join(", ");
    }
    
    // For all other primitive types (string, number, boolean)
    return String(value);
  })()}
</li>
                                ))}
                            </ul>
                        </div>
                        <div className="mb-2">
                            <span className="font-medium">AI Report:</span>
                            <div className="bg-white rounded p-2 mt-1 text-xs text-gray-700 whitespace-pre-line">{parsedData.output.ai_report}</div>
                        </div>
                    </div>
                )}
            </div>
        
    </>
  )
}

export default ShowParsedData