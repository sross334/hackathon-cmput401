import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);
const API_ROOT = "http://127.0.0.1:8000/api";

function uid(prefix) {
  const value = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `${prefix}-${value}`;
}

function communicationFromApi(communication) {
  return {
    id: communication.id,
    appId: communication.application,
    date: communication.date || "",
    type: communication.communication_type || "note",
    subject: communication.subject || "",
    body: communication.body || "",
  };
}

function applicationFromApi(application) {
  return {
    id: application.id,
    company: application.company || "",
    position: application.position || "",
    url: application.url || "",
    location: application.location || "",
    salary: application.salary || "",
    dateApplied: application.date_applied || "",
    status: application.status || "applied",
    notes: application.notes || "",
    reminderDate: application.reminder_date || "",
    reminderNote: application.reminder_note || "",
    logoColor: application.logo_color || "#7C5CFC",
    tags: application.tags || [],
    resumeCustomization: application.resume_customization || "",
    communications: (application.communications || []).map(communicationFromApi),
  };
}

function applicationToApi(application) {
  const payload = {};
  const fields = {
    id: "id",
    company: "company",
    position: "position",
    url: "url",
    location: "location",
    salary: "salary",
    dateApplied: "date_applied",
    status: "status",
    notes: "notes",
    reminderDate: "reminder_date",
    reminderNote: "reminder_note",
    logoColor: "logo_color",
    tags: "tags",
    resumeCustomization: "resume_customization",
  };

  for (const [clientName, apiName] of Object.entries(fields)) {
    if (Object.hasOwn(application, clientName)) {
      const value = application[clientName];
      payload[apiName] = ["date_applied", "reminder_date"].includes(apiName) && value === "" ? null : value;
    }
  }
  return payload;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  if (!response.ok) {
    let detail = `Request failed (${response.status})`;
    try { detail = JSON.stringify(await response.json()); } catch { /* keep status message */ }
    throw new Error(detail);
  }

  if (response.status === 204) return null;
  return response.json();
}

export function AppProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/applications/")
      .then((data) => setApplications(data.map(applicationFromApi)))
      .catch((requestError) => {
        console.error("Error loading applications:", requestError);
        setError("Could not connect to the Django server.");
      })
      .finally(() => setLoading(false));
  }, []);

  async function addApplication(application) {
    try {
      const payload = applicationToApi({ ...application, id: uid("app") });
      const created = applicationFromApi(await apiRequest("/applications/", { method: "POST", body: JSON.stringify(payload) }));
      setApplications((current) => [created, ...current]);
      setError("");
      return created;
    } catch (requestError) {
      console.error("Error adding application:", requestError);
      setError("The application could not be saved.");
      return null;
    }
  }

  async function updateApplication(id, changes) {
    try {
      const updated = applicationFromApi(await apiRequest(`/applications/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(applicationToApi(changes)),
      }));
      setApplications((current) => current.map((application) => application.id === id ? updated : application));
      setError("");
      return updated;
    } catch (requestError) {
      console.error("Error updating application:", requestError);
      setError("The application changes could not be saved.");
      return null;
    }
  }

  async function deleteApplication(id) {
    try {
      await apiRequest(`/applications/${id}/`, { method: "DELETE" });
      setApplications((current) => current.filter((application) => application.id !== id));
      setError("");
    } catch (requestError) {
      console.error("Error deleting application:", requestError);
      setError("The application could not be deleted.");
    }
  }

  function setStatus(id, status) {
    return updateApplication(id, { status });
  }

  async function addCommunication(applicationId, communication) {
    try {
      const payload = {
        id: uid("comm"),
        application: applicationId,
        date: communication.date,
        communication_type: communication.type,
        subject: communication.subject,
        body: communication.body,
      };
      const created = communicationFromApi(await apiRequest("/communications/", { method: "POST", body: JSON.stringify(payload) }));
      setApplications((current) => current.map((application) => application.id === applicationId
        ? { ...application, communications: [...application.communications, created] }
        : application));
      setError("");
      return created;
    } catch (requestError) {
      console.error("Error adding communication:", requestError);
      setError("The communication could not be saved.");
      return null;
    }
  }

  async function deleteCommunication(applicationId, communicationId) {
    try {
      await apiRequest(`/communications/${communicationId}/`, { method: "DELETE" });
      setApplications((current) => current.map((application) => application.id === applicationId
        ? { ...application, communications: application.communications.filter((communication) => communication.id !== communicationId) }
        : application));
      setError("");
    } catch (requestError) {
      console.error("Error deleting communication:", requestError);
      setError("The communication could not be deleted.");
    }
  }

  return (
    <AppContext.Provider value={{
      applications,
      loading,
      error,
      addApplication,
      updateApplication,
      deleteApplication,
      setStatus,
      addCommunication,
      deleteCommunication,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be inside AppProvider");
  return context;
}
