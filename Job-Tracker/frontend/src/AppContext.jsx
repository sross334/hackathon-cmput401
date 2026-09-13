import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AppContext = createContext(null);

const API_URL = "http://127.0.0.1:8000/api/applications/";

export function AppProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }

        return response.json();
      })
      .then((data) => {
        setApplications(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading applications:", error);
        setLoading(false);
      });
  }, []);

  function addApplication(application) {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(application),
    })
      .then((response) => response.json())
      .then((newApplication) => {
        setApplications((previousApplications) => [
          newApplication,
          ...previousApplications,
        ]);
      })
      .catch((error) => {
        console.error("Error adding application:", error);
      });
  }

  function updateApplication(id, changes) {
    fetch(`${API_URL}${id}/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(changes),
    })
      .then((response) => response.json())
      .then((updatedApplication) => {
        setApplications((previousApplications) =>
          previousApplications.map((application) =>
            application.id === id
              ? updatedApplication
              : application
          )
        );
      })
      .catch((error) => {
        console.error("Error updating application:", error);
      });
  }

  function deleteApplication(id) {
    fetch(`${API_URL}${id}/`, {
      method: "DELETE",
    })
      .then(() => {
        setApplications((previousApplications) =>
          previousApplications.filter(
            (application) => application.id !== id
          )
        );
      })
      .catch((error) => {
        console.error("Error deleting application:", error);
      });
  }

  function setStatus(id, status) {
    updateApplication(id, { status });
  }

  return (
    <AppContext.Provider
      value={{
        applications,
        resume,
        setResume,
        loading,
        addApplication,
        updateApplication,
        deleteApplication,
        setStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be inside AppProvider");
  }

  return context;
}
