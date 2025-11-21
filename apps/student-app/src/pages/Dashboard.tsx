import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../packages/convex/convex/_generated/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import { getCourseContextHelp } from "@marlion/ai";
import { Button, Loading } from "@marlion/ui";

type Tab = "bootcamp" | "problem" | "tracker" | "helpdesk";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, studentProfile, signOut } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<Tab>("bootcamp");

  if (!studentProfile) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-marlion-bg">
      {/* Header/Navbar */}
      <header className="bg-marlion-cardBg border-b border-marlion-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Marlion Internship</h1>
              <span className="text-sm text-marlion-muted">
                {studentProfile.stream.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-marlion-text">{studentProfile.name}</span>
              <button
                onClick={() => signOut()}
                className="text-marlion-muted hover:text-marlion-danger transition-colors"
              >
                <i className="fa-solid fa-right-from-bracket mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-marlion-cardBg border-b border-marlion-border">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            <TabButton
              active={activeTab === "bootcamp"}
              onClick={() => setActiveTab("bootcamp")}
              icon="fa-graduation-cap"
              label="Bootcamp"
            />
            <TabButton
              active={activeTab === "problem"}
              onClick={() => setActiveTab("problem")}
              icon="fa-lightbulb"
              label="Problem Statement"
            />
            <TabButton
              active={activeTab === "tracker"}
              onClick={() => setActiveTab("tracker")}
              icon="fa-tasks"
              label="Project Tracker"
            />
            <TabButton
              active={activeTab === "helpdesk"}
              onClick={() => setActiveTab("helpdesk")}
              icon="fa-life-ring"
              label="Help Desk"
            />
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === "bootcamp" && <BootcampTab studentProfile={studentProfile} />}
        {activeTab === "problem" && <ProblemTab studentProfile={studentProfile} />}
        {activeTab === "tracker" && <ProjectTrackerTab studentProfile={studentProfile} />}
        {activeTab === "helpdesk" && <HelpDeskTab studentProfile={studentProfile} />}
      </div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
        active
          ? "text-marlion-primary border-marlion-primary"
          : "text-marlion-muted border-transparent hover:text-marlion-text"
      }`}
    >
      <i className={`fa-solid ${icon} mr-2`}></i>
      {label}
    </button>
  );
}

// ============= BOOTCAMP TAB =============
function BootcampTab({ studentProfile }: { studentProfile: any }) {
  const { showToast } = useToast();
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Convex queries and mutations
  const modules = useQuery(api.courses.getAllModules, {
    stream: studentProfile.stream,
  });
  const moduleProgress = useQuery(api.courses.getStudentProgress, {
    studentId: studentProfile._id,
  });
  const startModule = useMutation(api.courses.startModule);
  const completeModule = useMutation(api.courses.completeModule);
  const submitKnowledgeCheck = useMutation(api.courses.submitKnowledgeCheck);

  const handleStartModule = async (moduleId: string) => {
    try {
      await startModule({
        studentId: studentProfile._id,
        moduleId,
      });
      showToast("Module started!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to start module", "error");
    }
  };

  const handleCompleteModule = async (moduleId: string) => {
    try {
      await completeModule({
        studentId: studentProfile._id,
        moduleId,
      });
      showToast("Module completed!", "success");
      setSelectedModule(null);
    } catch (error: any) {
      showToast(error.message || "Failed to complete module", "error");
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || !selectedModule) return;

    setIsThinking(true);
    setAiResponse("");

    try {
      const response = await getCourseContextHelp(
        aiQuery,
        selectedModule.title,
        selectedModule.content || "Course module content",
        studentProfile.stream
      );
      setAiResponse(response);
    } catch (error: any) {
      showToast(error.message || "Failed to get AI response", "error");
      setAiResponse("I couldn't fetch an answer at the moment. Please try again.");
    } finally {
      setIsThinking(false);
    }
  };

  const getProgress = (moduleId: string) => {
    return moduleProgress?.find((p: any) => p.moduleId === moduleId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Bootcamp Training</h2>
        <p className="text-marlion-muted">
          Complete all modules to build your foundation in {studentProfile.stream.replace(/_/g, " ")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-white">Course Modules</h3>
          {!modules ? (
            <Loading />
          ) : modules.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <p className="text-marlion-muted">No modules available yet</p>
            </div>
          ) : (
            modules.map((module: any) => {
              const progress = getProgress(module._id);
              const isCompleted = progress?.completedAt !== undefined;
              const isStarted = progress?.startedAt !== undefined;

              return (
                <button
                  key={module._id}
                  onClick={() => setSelectedModule(module)}
                  className={`w-full glass-card p-4 text-left transition-all hover:border-marlion-primary ${
                    selectedModule?._id === module._id ? "border-marlion-primary" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-white">{module.title}</h4>
                    {isCompleted && (
                      <i className="fa-solid fa-check-circle text-marlion-success"></i>
                    )}
                  </div>
                  <p className="text-xs text-marlion-muted mb-2">{module.description}</p>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`px-2 py-1 rounded text-xs ${
                        isCompleted
                          ? "bg-marlion-success/20 text-marlion-success"
                          : isStarted
                          ? "bg-marlion-warning/20 text-marlion-warning"
                          : "bg-marlion-muted/20 text-marlion-muted"
                      }`}
                    >
                      {isCompleted ? "Completed" : isStarted ? "In Progress" : "Not Started"}
                    </div>
                    <span className="text-xs text-marlion-muted">{module.estimatedMinutes} min</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Module Content */}
        <div className="lg:col-span-2">
          {!selectedModule ? (
            <div className="glass-card p-12 text-center">
              <i className="fa-solid fa-arrow-left text-4xl text-marlion-muted mb-4"></i>
              <p className="text-marlion-muted">Select a module to view content</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Module Header */}
              <div className="glass-card p-6">
                <h3 className="text-2xl font-bold text-white mb-2">{selectedModule.title}</h3>
                <p className="text-marlion-text mb-4">{selectedModule.description}</p>
                {selectedModule.videoUrl && (
                  <div className="aspect-video bg-marlion-bg rounded-xl overflow-hidden mb-4">
                    <iframe
                      src={selectedModule.videoUrl}
                      className="w-full h-full"
                      allowFullScreen
                      title={selectedModule.title}
                    ></iframe>
                  </div>
                )}
                <div className="flex space-x-3">
                  {!getProgress(selectedModule._id)?.startedAt && (
                    <Button
                      variant="primary"
                      onClick={() => handleStartModule(selectedModule._id)}
                    >
                      <i className="fa-solid fa-play mr-2"></i>
                      Start Module
                    </Button>
                  )}
                  {getProgress(selectedModule._id)?.startedAt &&
                    !getProgress(selectedModule._id)?.completedAt && (
                      <Button
                        variant="success"
                        onClick={() => handleCompleteModule(selectedModule._id)}
                      >
                        <i className="fa-solid fa-check mr-2"></i>
                        Mark as Complete
                      </Button>
                    )}
                </div>
              </div>

              {/* AI Tutor */}
              <div className="glass-card p-6">
                <h4 className="font-bold text-white mb-4 flex items-center">
                  <i className="fa-solid fa-robot text-marlion-primary mr-2"></i>
                  AI Tutor - Ask Questions
                </h4>
                <form onSubmit={handleAskAI} className="space-y-4">
                  <textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask anything about this module..."
                    rows={3}
                    className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                    disabled={isThinking}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isThinking || !aiQuery.trim()}
                  >
                    {isThinking ? "Thinking..." : "Ask AI"}
                  </Button>
                </form>
                {aiResponse && (
                  <div className="mt-4 bg-marlion-primary/10 border border-marlion-primary/20 rounded-xl p-4">
                    <p className="text-marlion-text text-sm whitespace-pre-wrap">{aiResponse}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= PROBLEM STATEMENT TAB =============
function ProblemTab({ studentProfile }: { studentProfile: any }) {
  const { showToast } = useToast();
  const [proposalText, setProposalText] = useState("");
  const [loading, setLoading] = useState(false);

  // Convex queries and mutations
  const assignedProject = useQuery(api.projects.getStudentProject, {
    studentId: studentProfile._id,
  });
  const submitProposal = useMutation(api.projects.submitProposal);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalText.trim()) {
      showToast("Please enter your project proposal", "error");
      return;
    }

    setLoading(true);
    try {
      await submitProposal({
        studentId: studentProfile._id,
        title: `Custom Project - ${studentProfile.stream}`,
        description: proposalText,
        stream: studentProfile.stream,
      });
      showToast("Proposal submitted successfully!", "success");
      setProposalText("");
    } catch (error: any) {
      showToast(error.message || "Failed to submit proposal", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Project Assignment</h2>
        <p className="text-marlion-muted">
          Work on assigned project or propose your own custom project
        </p>
      </div>

      {assignedProject ? (
        <div className="glass-card p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{assignedProject.title}</h3>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    assignedProject.status === "APPROVED"
                      ? "bg-marlion-success/20 text-marlion-success"
                      : assignedProject.status === "PENDING"
                      ? "bg-marlion-warning/20 text-marlion-warning"
                      : "bg-marlion-danger/20 text-marlion-danger"
                  }`}
                >
                  {assignedProject.status}
                </span>
                <span className="text-sm text-marlion-muted">
                  {assignedProject.stream.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
            <h4 className="font-bold text-white mb-3">Description</h4>
            <p className="text-marlion-text whitespace-pre-wrap">{assignedProject.description}</p>
          </div>

          {assignedProject.requirements && (
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-6 mb-6">
              <h4 className="font-bold text-white mb-3">Requirements</h4>
              <ul className="space-y-2">
                {assignedProject.requirements.split("\n").map((req: string, index: number) => (
                  <li key={index} className="flex items-start text-marlion-text text-sm">
                    <i className="fa-solid fa-check text-marlion-primary mr-2 mt-1"></i>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {assignedProject.reviewNotes && (
            <div className="bg-marlion-primary/10 border border-marlion-primary/20 rounded-xl p-4">
              <h4 className="font-bold text-white mb-2">Admin Notes</h4>
              <p className="text-marlion-text text-sm">{assignedProject.reviewNotes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Default Project */}
          <div className="glass-card p-6">
            <div className="w-16 h-16 bg-marlion-primary/10 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-file-alt text-3xl text-marlion-primary"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Default Project</h3>
            <p className="text-marlion-muted mb-4">
              Waiting for admin to assign you a default project based on your stream
            </p>
            <div className="bg-marlion-bg/50 border border-marlion-border rounded-xl p-4">
              <p className="text-sm text-marlion-text">
                <strong>Theme:</strong> Assistive technologies for neurodiverse children
              </p>
              <p className="text-sm text-marlion-text mt-2">
                <strong>Stream:</strong> {studentProfile.stream.replace(/_/g, " ")}
              </p>
            </div>
          </div>

          {/* Custom Proposal */}
          <div className="glass-card p-6">
            <div className="w-16 h-16 bg-marlion-success/10 rounded-full flex items-center justify-center mb-4">
              <i className="fa-solid fa-lightbulb text-3xl text-marlion-success"></i>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Propose Custom Project</h3>
            <p className="text-marlion-muted mb-4">
              Have an idea? Submit a custom project proposal for admin review
            </p>
            <form onSubmit={handleSubmitProposal} className="space-y-4">
              <textarea
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                placeholder="Describe your project idea, objectives, and implementation plan..."
                rows={6}
                className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                required
              />
              <Button type="submit" variant="success" disabled={loading} className="w-full">
                {loading ? "Submitting..." : "Submit Proposal"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============= PROJECT TRACKER TAB =============
function ProjectTrackerTab({ studentProfile }: { studentProfile: any }) {
  const { showToast } = useToast();
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [logContent, setLogContent] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [loading, setLoading] = useState(false);

  // Convex queries and mutations
  const tasks = useQuery(api.tasks.getTasksByStudent, {
    studentId: studentProfile._id,
  });
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const submitDailyLog = useMutation(api.tasks.submitDailyLog);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTask({
        studentId: studentProfile._id,
        title: taskTitle,
        description: taskDescription,
      });
      showToast("Task created successfully!", "success");
      setShowTaskModal(false);
      setTaskTitle("");
      setTaskDescription("");
    } catch (error: any) {
      showToast(error.message || "Failed to create task", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask({
        taskId,
        status: newStatus,
      });
      showToast("Task updated!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to update task", "error");
    }
  };

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitDailyLog({
        studentId: studentProfile._id,
        content: logContent,
        githubLink: githubLink || undefined,
      });
      showToast("Daily log submitted!", "success");
      setShowLogModal(false);
      setLogContent("");
      setGithubLink("");
    } catch (error: any) {
      showToast(error.message || "Failed to submit log", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks?.filter((task: any) => task.status === status) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Project Tracker</h2>
          <p className="text-marlion-muted">Manage tasks and track your daily progress</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={() => setShowLogModal(true)}>
            <i className="fa-solid fa-book mr-2"></i>
            Daily Log
          </Button>
          <Button variant="primary" onClick={() => setShowTaskModal(true)}>
            <i className="fa-solid fa-plus mr-2"></i>
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn
          title="To Do"
          status="TODO"
          tasks={getTasksByStatus("TODO")}
          onUpdateStatus={handleUpdateTaskStatus}
          color="muted"
        />
        <KanbanColumn
          title="In Progress"
          status="IN_PROGRESS"
          tasks={getTasksByStatus("IN_PROGRESS")}
          onUpdateStatus={handleUpdateTaskStatus}
          color="warning"
        />
        <KanbanColumn
          title="Done"
          status="DONE"
          tasks={getTasksByStatus("DONE")}
          onUpdateStatus={handleUpdateTaskStatus}
          color="success"
        />
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Task Title
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="E.g., Implement user authentication"
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Description
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task details..."
                  rows={4}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowTaskModal(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Submit Daily Log</h3>
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  What did you work on today?
                </label>
                <textarea
                  value={logContent}
                  onChange={(e) => setLogContent(e.target.value)}
                  placeholder="Describe your work, challenges faced, and learnings..."
                  rows={6}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  GitHub Link (Optional)
                </label>
                <input
                  type="url"
                  value={githubLink}
                  onChange={(e) => setGithubLink(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowLogModal(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? "Submitting..." : "Submit Log"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Kanban Column Component
function KanbanColumn({
  title,
  status,
  tasks,
  onUpdateStatus,
  color,
}: {
  title: string;
  status: TaskStatus;
  tasks: any[];
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  color: string;
}) {
  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white">{title}</h3>
        <span
          className={`px-2 py-1 rounded text-xs bg-marlion-${color}/20 text-marlion-${color}`}
        >
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="bg-marlion-bg/50 border border-marlion-border border-dashed rounded-xl p-6 text-center">
            <p className="text-sm text-marlion-muted">No tasks</p>
          </div>
        ) : (
          tasks.map((task: any) => (
            <div
              key={task._id}
              className="bg-marlion-bg border border-marlion-border rounded-xl p-4 hover:border-marlion-primary transition-all cursor-pointer"
            >
              <h4 className="font-bold text-white text-sm mb-2">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-marlion-muted mb-3">{task.description}</p>
              )}
              <div className="flex space-x-2">
                {status !== "TODO" && (
                  <button
                    onClick={() => onUpdateStatus(task._id, "TODO")}
                    className="text-xs text-marlion-muted hover:text-marlion-warning"
                    title="Move to To Do"
                  >
                    <i className="fa-solid fa-arrow-left"></i>
                  </button>
                )}
                {status !== "IN_PROGRESS" && (
                  <button
                    onClick={() => onUpdateStatus(task._id, "IN_PROGRESS")}
                    className="text-xs text-marlion-muted hover:text-marlion-primary"
                    title="Move to In Progress"
                  >
                    <i className="fa-solid fa-play"></i>
                  </button>
                )}
                {status !== "DONE" && (
                  <button
                    onClick={() => onUpdateStatus(task._id, "DONE")}
                    className="text-xs text-marlion-muted hover:text-marlion-success"
                    title="Move to Done"
                  >
                    <i className="fa-solid fa-check"></i>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============= HELP DESK TAB =============
function HelpDeskTab({ studentProfile }: { studentProfile: any }) {
  const { showToast } = useToast();
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // Convex queries and mutations
  const tickets = useQuery(api.support.getStudentTickets, {
    studentId: studentProfile._id,
  });
  const createTicket = useMutation(api.support.createHelpTicket);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createTicket({
        studentId: studentProfile._id,
        title: ticketTitle,
        description: ticketDescription,
      });
      showToast("Help ticket created successfully!", "success");
      setShowTicketModal(false);
      setTicketTitle("");
      setTicketDescription("");
    } catch (error: any) {
      showToast(error.message || "Failed to create ticket", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">AI Help Desk</h2>
          <p className="text-marlion-muted">Get help with technical issues and questions</p>
        </div>
        <Button variant="primary" onClick={() => setShowTicketModal(true)}>
          <i className="fa-solid fa-plus mr-2"></i>
          New Ticket
        </Button>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {!tickets ? (
          <Loading />
        ) : tickets.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <i className="fa-solid fa-ticket text-5xl text-marlion-muted mb-4"></i>
            <p className="text-marlion-muted mb-4">No help tickets yet</p>
            <Button variant="primary" onClick={() => setShowTicketModal(true)}>
              Create Your First Ticket
            </Button>
          </div>
        ) : (
          tickets.map((ticket: any) => (
            <div key={ticket._id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{ticket.title}</h3>
                  <p className="text-sm text-marlion-muted">
                    Created {new Date(ticket._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    ticket.status === "RESOLVED"
                      ? "bg-marlion-success/20 text-marlion-success"
                      : ticket.status === "IN_PROGRESS"
                      ? "bg-marlion-warning/20 text-marlion-warning"
                      : "bg-marlion-primary/20 text-marlion-primary"
                  }`}
                >
                  {ticket.status.replace(/_/g, " ")}
                </span>
              </div>
              <p className="text-marlion-text text-sm whitespace-pre-wrap mb-4">
                {ticket.description}
              </p>
              {ticket.response && (
                <div className="bg-marlion-primary/10 border border-marlion-primary/20 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <i className="fa-solid fa-robot text-marlion-primary mr-2"></i>
                    <span className="font-bold text-white text-sm">AI Response</span>
                  </div>
                  <p className="text-marlion-text text-sm whitespace-pre-wrap">{ticket.response}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Help Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Issue Title
                </label>
                <input
                  type="text"
                  value={ticketTitle}
                  onChange={(e) => setTicketTitle(e.target.value)}
                  placeholder="E.g., Cannot access module videos"
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-marlion-text mb-2">
                  Description
                </label>
                <textarea
                  value={ticketDescription}
                  onChange={(e) => setTicketDescription(e.target.value)}
                  placeholder="Describe your issue in detail..."
                  rows={6}
                  className="w-full bg-marlion-bg border border-marlion-border rounded-xl px-4 py-3 text-white placeholder-marlion-muted focus:outline-none focus:border-marlion-primary transition-colors resize-none"
                  required
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowTicketModal(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? "Creating..." : "Create Ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
