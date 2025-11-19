"use client"

import { getCasesS1, getSuspectContactAndBankInfo } from "@/Actions/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Building, CreditCard, Eye, AtSign, MessageSquare, Smartphone, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type TemplateType = "telecom" | "bank" | "payment" | "social" | "google";

interface Template {
  id: TemplateType;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

interface SuspectInfo {
  phone?: string;
  case_id?: string;
  bank_accounts?: string;
  upi_ids?: string;
  social_media_ids?: string;
  emails?: string; // Optional field for Gmail ID
}

interface FormData {
  caseDetails: string;
  phoneNumbers: string;
  accountNumbers: string;
  upiIds: string;
  userIds: string;
  gmailId: string; // Optional field for Gmail ID
  sla: string;
}

const templates: Template[] = [
  {
    id: "telecom",
    title: "DOT/Telecom",
    icon: Smartphone,
    description: "CDR, Tower location, Subscriber details",
  },
  {
    id: "bank",
    title: "Banks",
    icon: Building,
    description: "Account statements, Transaction history",
  },
  {
    id: "payment",
    title: "Payment Gateway",
    icon: CreditCard,
    description: "UPI transactions, Merchant details",
  },
  {
    id: "social",
    title: "Social Media",
    icon: MessageSquare,
    description: "User profiles, Chat logs, IP addresses",
  },
  {
    id: "google",
    title: "Google",
    icon: AtSign,
    description: "Gmail details, Account metadata",
  }
];
const defaultFormData: FormData = {
  caseDetails: "",
  phoneNumbers: "",
  accountNumbers: "",
  upiIds: "",
  userIds: "",
  gmailId: "", // Optional field for Gmail ID
  sla: "",
};

const templateDefaultCaseDetails = {
  telecom: "Request for Subscriber Details of Mobile Numbers Involved in WhatsApp-Based Online Scam",
  bank: "Request for Account Holder Details and Transaction History – Suspected Involvement in Online Scam Activity (U/s 91 CrPC)",
  payment: "Request for Merchant and Transaction Details – Suspected Online Scam Activity – U/s 91 CrPC",
  social: "Request for Social Media Account Details and Login Metadata – Section 91 CrPC & 69(A) IT Act",
  google: "Submission of Gmail details for Mobile Number Request – Attachment Enclosed"
};

const templateDefaultEmails = {
  telecom: "telecomlersoff@gmail.com",
  bank: "sbilersoff@gmail.com",
  payment: "paytmlersoff@gmail.com",
  social: "metalersoff@gmail.com",
  google: "goolersoff@gmail.com"
};

// Preview Dialog Component
const PreviewDialog = ({
  isOpen,
  onClose,
  templateType,
  formData
}: {
  isOpen: boolean;
  onClose: () => void;
  templateType: TemplateType;
  formData: FormData;
}) => {
  if (!isOpen) return null;

  const generateHtmlContent = () => {
    switch (templateType) {
      case "bank":
        const accountNumbers = formData.accountNumbers
          ? formData.accountNumbers.split(',').map(num => num.trim())
          : [];

        return `
          <html>
          <head>
            <title>Bank Request</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
              ul, ol { padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <h2>Subject: Request for Account Holder Details and Transaction History - Suspected Involvement in Online Scam Activity (U/s 91 CrPC)</h2>

            <p>Respected Sir/Madam,</p>

            <p>This is to bring to your kind attention that during cyber surveillance and routine intelligence monitoring, a WhatsApp group has been identified that appears to be involved in a large-scale online investment fraud. The group lures unsuspecting individuals with deceptive investment opportunities and collects funds under false pretenses.</p>

            <p>As part of the preliminary investigation, we have identified the following bank account(s) suspected to be used for receiving money from victims:</p>

            <h3>Suspected Beneficiary Account Details:</h3>
            <ul>
                ${accountNumbers.map((num, index) => `
                <li><strong>Account Number:</strong> ${num}</li>
                <li><strong>Bank Name:</strong> [Insert Bank Name]</li>
                <li><strong>IFSC Code:</strong> [Insert IFSC Code]</li>
                ${index < accountNumbers.length - 1 ? '<br>' : ''}
                `).join('')}
                <!-- Add more accounts as needed -->
            </ul>

            <h3>Request for Information under Section 91 CrPC:</h3>
            <p>You are kindly requested to provide the following details for each of the above-mentioned accounts:</p>
            <ol>
                <li>Account Holder’s Full Name</li>
                <li>Father’s Name</li>
                <li>Registered Address as per KYC</li>
                <li>Mobile Number linked to the account</li>
                <li>Email ID linked to the account (if available)</li>
                <li>Date of Account Opening</li>
                <li>Mode of Account Opening (Online/Offline)</li>
                <li>KYC Documents submitted (Photo ID & Address Proof)</li>
                <li>Last 10 transactions carried out from the account (credit/debit with date, amount, and counterparty details, if available)</li>
            </ol>

            <p>This information is critical for verifying the identity and activities of the suspected individuals and proceeding with further legal action. We request your cooperation in treating this matter as urgent and furnishing the requested details along with attested supporting documents at the earliest.</p>

            <p>Warm regards,</p>

            <p>
                <strong>Inspector of Police</strong><br>
                Email: <a href="mailto:nodel.aihackathon@gmail.com">nodel.aihackathon@gmail.com</a><br>
                Phone: 9999999999
            </p>
          </body>
          </html>
        `;

      case "telecom":
        const phoneNumbers = formData.phoneNumbers
          ? formData.phoneNumbers.split(',').map(num => num.trim())
          : [];

        return `
          <html>
          <head>
            <title>Telecom Request</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
              ul { padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <h2>Subject: Request for Subscriber Details of Mobile Numbers Involved in WhatsApp-Based Online Scam</h2>

            <p>Respected Sir/Madam,</p>

            <p>I am writing to request subscriber information under Section 91 of the Criminal Procedure Code, 1973, in connection with an investigation into an online fraud involving cheating and cyber deception under Section 420 of the IPC and Section 66-D of the Information Technology Act.</p>

            <p>During the course of the investigation, several mobile numbers were found to be associated with a fraudulent WhatsApp group promoting fake investment opportunities. These numbers appear to have played a role in orchestrating or facilitating the scam.</p>

            <h3>Identified Mobile Numbers:</h3>
            <ul>
                ${phoneNumbers.map(num => `<li>${num}</li>`).join('')}
                <!-- Add more as needed -->
            </ul>

            <p>To aid in the investigation and enable further legal action, I kindly request you to furnish the following subscriber details for each of the listed numbers:</p>

            <ul>
                <li>SIM Holder Name</li>
                <li>ID Proof submitted during activation</li>
                <li>Registered Address</li>
                <li>Date of Activation</li>
                <li>Service Provider Name</li>
                <li>SIM Retailer (including name and outlet address, if available)</li>
            </ul>

            <p>This information is essential for identifying and tracing the individuals involved. I would be grateful if the requested data, along with relevant attested documents, could be provided at the earliest.</p>

            <p>Thank you for your prompt attention and cooperation in this matter of public concern.</p>

            <p>Warm regards,<br><br>
                <strong>Inspector of Police</strong><br>
                Email: <a href="mailto:nodel.aihackathon@gmail.com">nodel.aihackathon@gmail.com</a><br>
                Phone: 9999999999
            </p>
          </body>
          </html>
        `;

      case "social":
        const userIds = formData.userIds
          ? formData.userIds.split(',').map(id => id.trim())
          : [];

        return `
          <html>
          <head>
            <title>Social Media Request</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
              ul { padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <p><strong>Subject:</strong> Request for Social Media Account Details and Login Metadata – Section 91 CrPC & 69(A) IT Act</p>

            <p>Respected Sir/Madam,</p>

            <p>This is an official request under <strong>Section 91 of the Criminal Procedure Code, 1973</strong>, pertaining to an ongoing investigation into an online scam involving fraudulent activity on Meta platforms.</p>

            <p>To aid the investigation, I request you to kindly provide the following information for the mobile numbers listed below:</p>

            <h3>1. Instagram and Facebook Account Linkages:</h3>
            <p>Please share all Instagram handles and Facebook profiles/pages linked to the mobile numbers:</p>
            <ul>
                ${userIds.map(id => `<li>${id}</li>`).join('')}
                <!-- Add more if necessary -->
            </ul>

            <h3>2. Account Access and Login Metadata:</h3>
            <p>For each account linked to the above numbers, kindly provide:</p>
            <ul>
                <li>Platform (Instagram / Facebook)</li>
                <li>Handle / Profile URL</li>
                <li>Date of access or login</li>
                <li>IP Address</li>
                <li>Device Type (OS & Browser/App)</li>
                <li>Login Location (City, State)</li>
            </ul>

            <p>Please treat this request as <strong>urgent and confidential</strong>. The data may be shared securely with the undersigned via official communication channels.</p>

            <p>Warm regards,</p>
            <p>
                <strong>Inspector of Police</strong><br>
                [Police Station Name / Cyber Crime Unit]<br>
                <strong>Email:</strong> nodel.aihackathon@gmail.com<br>
                <strong>Phone:</strong> 9999999999
            </p>
          </body>
          </html>
        `;

      case "payment":
        const upiIds = formData.upiIds
          ? formData.upiIds.split(',').map(id => id.trim())
          : [];

        return `
          <html>
          <head>
            <title>Payment Gateway Request</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
              ul { padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <p><strong>Subject:</strong> Request for Merchant and Transaction Details – Suspected Online Scam Activity – U/s 91 CrPC</p>

            <p>Respected Sir/Madam,</p>

            <p>This communication is issued under the authority of <strong>Section 91 of the Criminal Procedure Code (CrPC), 1973</strong>, in connection with a suspected case of online financial fraud currently under preliminary inquiry.</p>

            <p>During our cyber surveillance and intelligence operations, it has come to light that fraudulent actors have been using your payment gateway services to receive funds from victims by posing as legitimate investment platforms or business schemes.</p>

            <h3>Suspected Merchant / Payment Details:</h3>
            <ul>
                ${upiIds.map(id => `<li>Merchant ID / MID: ${id}</li>`).join('')}
            </ul>

            <h3>Information Requested:</h3>
            <p>Kindly provide the following details for the above-mentioned merchant/payment identifier:</p>
            <ul>
                <li>Registered Merchant Name</li>
                <li>Merchant Business Name / Description</li>
                <li>Mobile Number and Email ID Registered</li>
                <li>Date of Account Creation</li>
                <li>Bank Account(s) Linked to the Merchant Account</li>
                <li>KYC Documents Submitted</li>
            </ul>

            <p>This information is essential for identifying the individuals or entities involved and for taking appropriate legal and financial action. We request you to treat this request as <strong>urgent and confidential</strong>, and kindly share the required details with the undersigned at the earliest.</p>

            <p>Please feel free to contact us for any clarifications or to coordinate securely regarding the transmission of sensitive data.</p>

            <p>Warm regards,</p>

            <p>
                <strong>Inspector of Police</strong><br>
                <strong>Email:</strong> nodel.aihackathon@gmail.com<br>
                <strong>Phone:</strong> 9999999999
            </p>
          </body>
          </html>
        `;

      case "google":
        const gmailIds = formData.gmailId
          ? formData.gmailId.split(',').map(id => id.trim())
          : [];

        return `
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Request for Gmail Details – CrPC 91 & IT Act 69(A)</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; }
              h3 { margin-top: 1.5rem; margin-bottom: 0.5rem; }
              ul, ol { padding-left: 1.5rem; }
              li { margin-bottom: 0.5rem; }
            </style>
          </head>
          <body>
            <p><strong>Subject:</strong> Request for Gmail Details and Login Metadata – Section 91 CrPC & 69(A) IT Act</p>

            <p>Respected Sir/Madam,</p>

            <p>This is an official request under <strong>Section 91 of the Criminal Procedure Code, 1973</strong>, pertaining to an ongoing investigation into an online scam involving fraudulent activity on Google platforms.</p>

            <p>To aid the investigation, I request you to kindly provide the following information for the Gmail IDs listed below:</p>

            <ol>
              <li>
                <strong>Linked Gmail Accounts:</strong><br>
                Please share all Gmail handles linked to the following:<br>
                ${gmailIds.length > 0 ? gmailIds.map(id => `${id}<br>`).join('') : '[Gmail ID(s)]'}
              </li>
              <br>
              <li>
                <strong>Gmail Details and Login Metadata:</strong><br>
                For each account linked to the above, kindly provide:<br>
                <ul>
                  <li>Platform (Google)</li>
                  <li>Email ID</li>
                  <li>Date of access or login</li>
                  <li>IP Address</li>
                  <li>Device Type (OS & Browser/App)</li>
                  <li>Login Location (City, State)</li>
                </ul>
              </li>
            </ol>

            <p>Please treat this request as <strong>urgent and confidential</strong>. The data may be shared securely with the undersigned via official communication channels.</p>

            <p>Warm regards,</p>
            <p>
                <strong>Inspector of Police</strong><br>
                [Police Station Name / Cyber Crime Unit]<br>
                <strong>Email:</strong> nodel.aihackathon@gmail.com<br>
                <strong>Phone:</strong> 9999999999
            </p>
          </body>
          </html>
        `;

      default:
        return `<p>No preview available for this template</p>`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Document Preview</h2>
          <button title="Document" onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div
          className="p-6 h-full overflow-auto"
          dangerouslySetInnerHTML={{ __html: generateHtmlContent() }}
        />
        <div className="flex justify-end p-4 border-t">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export function FormGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [caseIds, setCaseIds] = useState<string[]>([]);
  const [suspectInfo, setSuspectInfo] = useState<SuspectInfo[]>([]);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isLoading, setIsLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState(false);

  // Fixed sender email

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch cases
        const cases = await getCasesS1();
        setCaseIds(Array.isArray(cases) ? cases.map((c: { case_id: string }) => c.case_id) : []);
        // Fetch suspect info
        const suspects = await getSuspectContactAndBankInfo();
        setSuspectInfo(Array.isArray(suspects) ? suspects : []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setCaseIds([]);
        setSuspectInfo([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set default selectedCaseId to first case when caseIds are loaded
  useEffect(() => {
    if (caseIds.length > 0 && !selectedCaseId) {
      setSelectedCaseId(caseIds[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseIds]);

  useEffect(() => {
    if (selectedTemplate) {
      const updatedFormData = { ...formData };
      updatedFormData.caseDetails = templateDefaultCaseDetails[selectedTemplate];
      // Filter suspect info based on selected case ID
      const caseSpecificSuspects = suspectInfo.filter(suspect => 
        suspect.case_id === selectedCaseId // Assuming suspect info has case_id field
      );
      console.log(caseSpecificSuspects)
      if (caseSpecificSuspects.length > 0) {
        const phoneNumbers = Array.from(new Set(caseSpecificSuspects.map(s => s.phone).filter(Boolean))).join(", ");
        const accountNumbers = Array.from(new Set(caseSpecificSuspects.map(s => s.bank_accounts).filter(Boolean))).join(", ");
        const upiIds = Array.from(new Set(caseSpecificSuspects.map(s => s.upi_ids).filter(Boolean))).join(", ");
        const userIds = Array.from(new Set(caseSpecificSuspects.map(s => s.social_media_ids).filter(Boolean))).join(", ");
        const gmailId = Array.from(new Set(caseSpecificSuspects.map(s => s.emails).filter(Boolean))).join(", ");
        if (phoneNumbers) updatedFormData.phoneNumbers = phoneNumbers;
        if (accountNumbers) updatedFormData.accountNumbers = accountNumbers;
        if (upiIds) updatedFormData.upiIds = upiIds;
        if (userIds) updatedFormData.userIds = userIds;
        if (gmailId) updatedFormData.gmailId = gmailId;
        console.log(gmailId);
      }
      else{
        // Clear form fields if no suspects found for the case
        updatedFormData.phoneNumbers = "";
        updatedFormData.accountNumbers = "";
        updatedFormData.upiIds = "";
        updatedFormData.userIds = "";
        updatedFormData.gmailId = "";
      }
      setFormData(updatedFormData);
    }
    console.log("Updated form data:", formData);

  }, [selectedTemplate, suspectInfo, selectedCaseId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTemplateSelect = (templateId: TemplateType) => {
    setSelectedTemplate(templateId);
    setFormData(defaultFormData);
  };

  // Send data as JSON POST request
  const generateDocument = async (templateType: TemplateType, reMail :string ) => {
    if (!selectedCaseId) {
      alert("Please select a case ID first");
      return;
    }


    const payload = {
      // sender: senderEmail,
      recipient: reMail,
      case_id: selectedCaseId,
      type: templateType,
      // formData,
      sla: formData.sla, // Added SLA to payload
    };

    try {
      const response = await fetch("https://n8n.bestplanettechnology.com/webhook/send_crpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to send");
      alert("Data sent successfully!");
    } catch (error) {
      alert("Error sending data: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Open preview dialog
  const previewDocument = () => {
    if (!selectedCaseId || !selectedTemplate) {
      alert("Please select a case ID and template first");
      return;
    }
    setOpenPreview(true);
  };

  const renderFormPreview = () => {
    if (!selectedTemplate) {
      return (
        <div className="text-center text-muted-foreground py-12">
          Select a template to preview the form
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="text-center text-muted-foreground py-12">
          Loading form data...
        </div>
      );
    }

    const templateContent = {
      telecom: {
        title: "DOT/Telecom Request Form",
        fields: (
          <>
            <h4 className="text-lg font-semibold mb-4">Section 91 CrPC Request - Telecom Data</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-details">Case Details</Label>
                <Input
                  id="case-details"
                  placeholder="Enter case number and details"
                  value={formData.caseDetails}
                  onChange={(e) => handleInputChange('caseDetails', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone-numbers">Phone Numbers</Label>
                <Textarea
                  id="phone-numbers"
                  rows={3}
                  placeholder="Enter phone numbers to investigate"
                  value={formData.phoneNumbers || ""}
                  onChange={(e) => handleInputChange('phoneNumbers', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA</Label>
                <Input
                  id="sla"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Enter SLA"
                  value={formData.sla || ""}
                  onChange={(e) => handleInputChange('sla', e.target.value)}
                />
              </div>
            </div>
          </>
        ),
      },
      bank: {
        title: "Bank Request Form",
        fields: (
          <>
            <h4 className="text-lg font-semibold mb-4">Section 91 CrPC Request - Banking Data</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-details-bank">Case Details</Label>
                <Input
                  id="case-details-bank"
                  placeholder="Enter case number and details"
                  value={formData.caseDetails}
                  onChange={(e) => handleInputChange('caseDetails', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-numbers">Account Numbers</Label>
                <Textarea
                  id="account-numbers"
                  rows={3}
                  placeholder="Enter account numbers to investigate"
                  value={formData.accountNumbers || ""}
                  onChange={(e) => handleInputChange('accountNumbers', e.target.value)}
                />
                <Label htmlFor="sla">SLA</Label>
                <Input
                  id="sla"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Enter SLA"
                  value={formData.sla || ""}
                  onChange={(e) => handleInputChange('sla', e.target.value)}
                />

              </div>
            </div>
          </>
        ),
      },
      payment: {
        title: "Payment Gateway Request Form",
        fields: (
          <>
            <h4 className="text-lg font-semibold mb-4">Section 91 CrPC Request - Payment Gateway Data</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-details-payment">Case Details</Label>
                <Input
                  id="case-details-payment"
                  placeholder="Enter case number and details"
                  value={formData.caseDetails}
                  onChange={(e) => handleInputChange('caseDetails', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upi-ids">UPI IDs / Merchant IDs</Label>
                <Textarea
                  id="upi-ids"
                  rows={3}
                  placeholder="Enter UPI IDs or merchant IDs to investigate"
                  value={formData.upiIds || ""}
                  onChange={(e) => handleInputChange('upiIds', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA</Label>
                <Input
                  id="sla"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Enter SLA"
                  value={formData.sla || ""}
                  onChange={(e) => handleInputChange('sla', e.target.value)}
                />
              </div>
            </div>
          </>
        ),
      },
      social: {
        title: "Social Media Request Form",
        fields: (
          <>
            <h4 className="text-lg font-semibold mb-4">Section 91 CrPC Request - Social Media Data</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-details-social">Case Details</Label>
                <Input
                  id="case-details-social"
                  placeholder="Enter case number and details"
                  value={formData.caseDetails}
                  onChange={(e) => handleInputChange('caseDetails', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-ids">User IDs / Profiles</Label>
                <Textarea
                  id="user-ids"
                  rows={3}
                  placeholder="Enter social media user IDs or profile URLs"
                  value={formData.userIds || ""}
                  onChange={(e) => handleInputChange('userIds', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA</Label>
                <Input
                  id="sla"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Enter SLA"
                  value={formData.sla || ""}
                  onChange={(e) => handleInputChange('sla', e.target.value)}
                />
              </div>
            </div>
          </>
        ),
      },
      google: {
        title: "Google Request Form",
        fields: (
          <>
            <h4 className="text-lg font-semibold mb-4">Section 91 CrPC Request - Google Data</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="case-details-google">Case Details</Label>
                <Input
                  id="case-details-google"
                  placeholder="Enter case number and details"
                  value={formData.caseDetails}
                  onChange={(e) => handleInputChange('caseDetails', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-ids-google">Gmail ID</Label>
                <Textarea
                  id="user-ids-google"
                  rows={3}
                  placeholder="Enter Google mail IDs or profile URLs"
                  value={formData.gmailId || ""}
                  onChange={(e) => handleInputChange('gmailId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sla">SLA</Label>
                <Input
                  id="sla"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="Enter SLA"
                  value={formData.sla || ""}
                  onChange={(e) => handleInputChange('sla', e.target.value)}
                />
              </div>
            </div>
          </>
        ),
      }
    };

    const template = templateContent[selectedTemplate];
    const reMail = templateDefaultEmails[selectedTemplate];
    

    return (
      <div>
        <h3 className="text-xl font-semibold mb-4">{template.title}</h3>
        {template.fields}
        <div className="flex gap-2 mt-6">
          <Button
            onClick={() => generateDocument(selectedTemplate, reMail)}
            disabled={!selectedCaseId }
          >
            Send
          </Button>
          <Button
            variant="outline"
            onClick={previewDocument}
            disabled={!selectedCaseId}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">91 CrPC Form Generator</h2>
        </div>
        <div className="space-y-8">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Agency Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <div
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className={`p-6 border rounded-lg cursor-pointer text-center transition-colors ${selectedTemplate === template.id
                        ? "bg-accent text-accent-foreground border-accent"
                        : "hover:bg-accent border-border"
                        }`}
                    >
                      <Icon className="w-12 h-12 mx-auto mb-3" />
                      <div className="font-medium mb-2">{template.title}</div>
                      <div className="text-sm text-muted-foreground">{template.description}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          {/* Form Preview */}
          <Card>
            <CardHeader className="flex gap-10 items-center justify-between">
              <CardTitle>
                Form Preview
                <div className="mt-2">
                  <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select Case ID" />
                    </SelectTrigger>
                    <SelectContent>
                      {caseIds.length === 0 ? (
                        <div className="px-4 py-2 text-muted-foreground">
                          {isLoading ? "Loading cases..." : "No cases found"}
                        </div>
                      ) : (
                        caseIds.map((id) => (
                          <SelectItem key={id} value={id}>
                            {id}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
              <CardTitle className="flex gap-2 h-6 items-center justify-center">
                Recipient Email:
                <div className=" font-normal ">
                  {selectedTemplate ? templateDefaultEmails[selectedTemplate] : ""}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>{renderFormPreview()}</CardContent>
          </Card>
        </div>
      </div>

      <PreviewDialog
        isOpen={openPreview}
        onClose={() => setOpenPreview(false)}
        templateType={selectedTemplate!}
        formData={formData}
      />
    </>
  );
}
