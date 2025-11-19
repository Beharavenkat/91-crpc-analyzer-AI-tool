// server/actions/messageClassificationActions.ts
"use server"
import { supabase } from "@/utils/supabase";


export async function getSuspectInfo(suspect_id: string) {
  const { data, error } = await supabase
    .from('suspect')
    .select('*')
    .eq('id', suspect_id)
    .single()
  
  if (error) throw error
  return data
}
// Add to your messageClassificationActions.ts file

export async function getSessionsByCaseId(case_id: string) {
  const { data, error } = await supabase
    .from('sessions_s2')
    .select('*')
    .eq('case_id', case_id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getSessionsBySuspectId(suspect_id: string) {
  const { data, error } = await supabase
    .from('sessions_s2')
    .select('*')
    .eq('suspect_id', suspect_id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function getChatMessages(session_id: string) {
  const { data, error } = await supabase
    .from('chats_s2')
    .select('*')
    .eq('session_id', session_id)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}


export async function getPhoneFromSuspect(suspect_id: string) {
    if(!suspect_id){
        return {} 
    }
  const { data, error } = await supabase
    .from('suspect')
    .select('*')
    .eq('id', suspect_id)
  
  if (error) throw error
  return data[0]
}


// Update insertSessionId to include suspect_id
export async function insertSessionId(case_id: string, persona_id: string, suspect_id: string, phone: string) {
  const { data, error } = await supabase
    .from('sessions_s2')
    .insert({
      case_id,
      persona_id,
      suspect_id,
      phone
    })
    .select()

    
  
  if (error) throw error
  return data
}



export async function getClassifications() {
    const { data, error } = await supabase
        .from("91crpc_s1")
        .select("*")
        .order("created_at", { ascending: false })
    if (error) throw error;
    return data;
}

export async function getSuspects() {
    const { data, error } = await supabase
        .from("suspect")
        .select("*")
    if (error) throw error;
    return data;
}

export async function getSuspectsWithCase(case_id:string) {
    const { data, error } = await supabase
        .from("suspect")
        .select("*")
        .eq('case_id',case_id)
        
    if (error) throw error;
    return data;
}



export async function getCasesS1() {
    const { data, error } = await supabase
        .from("cases_s1")
        .select("*")
    if (error) throw error;
    return data;
}


// Get all cases from cases_s1 and join with 91crpc_s1 on case_id
export async function getCasesWith91crpc() {
    const { data, error } = await supabase
        .from('cases_s1')
        .select('*, 91crpc_s1(*)')
    if (error) throw error;
    return data;
}

// Get all 91crpc_s1 rows for a given case_id
export async function get91crpcByCaseId(case_id: string) {
    const { data, error } = await supabase
        .from('91crpc_s1')
        .select('*')
        .eq('case_id', case_id)
    if (error) throw error;
    return data;
}

export async function insertClassification(payload: {
    content: string;
    classification: "suspicious" | "benign";
    confidence_score: number;
    sender_location: string;
    source_platform: string;
    media_type: string;
}) {
    const { data, error } = await supabase
        .from("91crpc_s1")
        .insert({
            ...payload,
            created_at: new Date().toISOString(),
        })
        .select();
    if (error) throw error;
    return data;
}

export async function saveGroupLinkToDB(link: string, details: string | null) {
    // Insert a non-null value for 'content' to satisfy NOT NULL constraint
    const { data, error } = await supabase
        .from("91crpc_s1")
        .insert({
            group_link: link,
            // content: link, // use the link as content for traceability
            // classification: "benign", // default to benign
            // confidence_score: 0, // default to 0
            // sender_location: "", // default empty string
            group_details: details || "",
            source_platform: "whatsapp",
            media_type: "group-link",
            created_at: new Date().toISOString(),
        })
        .select('*')

    if (error) throw error
    return data
}

export async function updateClassification(id: string, updates: Partial<{
    content: string;
    classification: "suspicious" | "benign";
    confidence_score: number;
    sender_location: string;
    source_platform: string;
    media_type: string;
}>) {
    const { data, error } = await supabase
        .from("91crpc_s1")
        .update(updates)
        .eq("id", id)
        .select();
    if (error) throw error;
    return data;
}

export async function updateClassificationCaseId(id: string, updates: Partial<{
    case_id: string;
}>) {
    const { data, error } = await supabase
        .from("91crpc_s1")
        .update(updates)
        .eq("id", id)
        .select();
    if (error) throw error;
    return data;
}

export async function deleteClassification(id: string) {
    const { data, error } = await supabase
        .from("91crpc_s1")
        .delete()
        .eq("id", id)
        .select();
    if (error) throw error;
    return data;
}


export async function insertSuspectPhoneNumber(phone: string, case_id: string) {
    const { data, error } = await supabase
        .from("suspect")
        .insert({
            phone,
            case_id,
            created_at: new Date().toISOString(),
        })
        .select();
    if (error) throw error;
    return data;
}


export async function insertCaseId(case_id: string) {
    const { data, error } = await supabase
        .from("cases_s1")
        .insert({
            case_id,
            created_at: new Date().toISOString(),
        })
        .select();
    if (error) throw error;
    return data;
}


export async function InsertSession(case_id: string, persona_id: string) {
    const suspects = await getSuspectsWithCase(case_id);

    const data = []

    for(const suspect of suspects){

        // console.log(suspect)

        const suspect_id = suspect.id
        
        const { data:sd, error } = await supabase
        .from("sessions_s2")
        .insert({
            case_id,
            persona_id,
            suspect_id,
            init_by_ai:true,
            created_at: new Date().toISOString(),
        });    

        if (error) throw error;
        data.push(sd)
        
    }

    console.log(data)

    return data;
}

export async function insertClassificationWithCaseId(payload: {
    content: string;
    classification: "suspicious" | "benign";
    confidence_score: number;
    sender_location: string;
    source_platform: string;
    media_type: string;
}) {
    // Insert classification and get the inserted row
    const { data, error } = await supabase
        .from("91crpc_s1")
        .insert({
            ...payload,
            created_at: new Date().toISOString(),
        })
        .select();
    if (error) throw error;
    const inserted = Array.isArray(data) ? data[0] : data;
    if (inserted && inserted.id && payload.classification == "suspicious") {
        const caseIdPrefix = String(inserted.id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5);
        if (caseIdPrefix.length > 0) {
            const case_id = `case-${caseIdPrefix}`;
            inserted.case_id = case_id; // Add case_id to the inserted object
            await supabase
                .from("cases_s1")
                .insert({
                    case_id,
                    created_at: new Date().toISOString(),
                });
        }
    }
    return inserted;
}

export async function fetchPersonasFromSupabase() {
    // Fetch personas from Supabase table 'personas' with columns: name, description, context, age
    const { data, error } = await supabase
        .from("persona")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) throw error;
    return data;
}

export async function getSuperAdminPhoneNumbers() {
    // Fetch group data from 91crpc_s1 where the user is super admin
    // Adjust the field names below if your schema uses different names
    const { data, error } = await supabase
        .from("91crpc_s1")
        .select("phone, role")
        .eq("role", "super admin");
    if (error) throw error;
    // Return an array of phone numbers of super admins
    return data ? data.map((row) => row.phone) : [];
}

export async function fileUploads(formData: FormData, file_content: string) {
    // Extract the file from FormData
    const file = formData.get('file') as File | null;
    if (!file) throw new Error('No file uploaded');
    const filePath = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
        .from("fileupload/Group_chats")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
        });
    if (error) throw error;

    // Construct the public URL (adjust if you use RLS or signed URLs)
    const file_url = `fileupload/Group_chats/${filePath}`;

    // Return the inserted row

    return {
        file_content,file_url
    }
}

export async function saveGroupChatResult(id: string, dataObjects: Record<string, unknown>[]) {
    const { data, error } = await supabase
        .from("91crpc_s1")
        .update({ group_chat_result: JSON.stringify(dataObjects), created_at: new Date().toISOString() })
        .eq("id", id).select();

    if (error) throw error;
    return data;
}

// Insert a new suspect (all fields optional except created_at)
export async function insertSuspect(suspect: Partial<{
    name: string;
    phone: string;
    urls: string;
    case_id: string;
    source_platform: string;
    scam_patterns: string;
    upi_ids: string;
    bank_accounts: string;
    addresses: string;
    other_info: string;
    keywords: string;
    risk_indicators: string;
    amounts: string;
    victim_numbers: string;
}>) {
    const { data, error } = await supabase
        .from('suspect')
        .insert({ ...suspect, created_at: new Date().toISOString() })
        .select();
    if (error) throw error;
    return data;
}

// Get suspect by id
export async function getSuspectById(id: string) {
    const { data, error } = await supabase
        .from('suspect')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

    export async function getSuspectContactAndBankInfo() {
    const { data, error } = await supabase
        .from("suspect")
        .select("phone, bank_accounts, upi_ids, social_media_ids, emails, case_id")
    if (error) throw error;
    return data;
}


export async function getEmail(){
    const {data, error} = await supabase
    .from("emails")
    .select("*")
    .order("created_at", { ascending: false })
    if (error) throw error;
    return data;
}


export async function getSlaData(){
    const {data, error} = await supabase
    .from("sla_tracking")
    .select("*")
    .order("created_at", { ascending: false })
    console.log("SLA Data:", data);
    if (error) throw error;
    return data;
}

export async function getAllClases(){
    const { data, error } = await supabase
        .from("cases_s1")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAllPersona() {
    const { data, error } = await supabase
        .from("persona")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;    
}

export async function getAllChats() {
    const { data, error } = await supabase
        .from("chats_s2")
        .select("*")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

export async function getEmailById(id: string) {
    const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}