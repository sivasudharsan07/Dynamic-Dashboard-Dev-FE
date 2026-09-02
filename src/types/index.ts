// ============================================================
// Core Domain Types — Dynamic Dashboard Frontend
// ============================================================

export type TenantRole = "SUPER_USER" | "DB_ADMIN" | "NORMAL_USER";

export type TenantContext = {
  tenantId: string;
  tenantName: string;
  role: TenantRole;
  userId: string;
};

export type Session = {
  authenticated: boolean;
  userId: string;
  tenantId: string;
  tenantName: string;
  role: TenantRole;
  token?: string;
};

// ---- Dataset ----
export type DatasetType = "CSV" | "EXCEL" | "DBML";
export type DatasetStatus = "READY" | "INGESTING" | "PARTIAL" | "FAILED" | "DISABLED";

export type Dataset = {
  uniqueId: string;
  tenantId: string;
  displayName: string;
  type: DatasetType;
  status: DatasetStatus;
  sizeBytes?: number;
  rowCount?: number;
  owner?: string;
  modifiedAt?: string;
  qualityStatus?: string;
  sensitivity?: string;
};

// ---- Widget ----
export type WidgetType = "KPI" | "TABLE" | "LINE" | "BAR" | "PIE" | "DONUT" | "GAUGE";
export type WidgetStatus = "THINKING" | "ANALYZING" | "RENDERING" | "COMPLETED" | "FAILED";

export type DashboardWidget = {
  id: string;
  name: string;
  type: WidgetType;
  datasetIds: string[];
  threadId?: string;
  queryId?: string;
  status: WidgetStatus;
  span: number;
  position?: number;
  insight?: string;
  sourceTags?: string[];
  data?: unknown;
  config?: unknown;
};

export type WidgetProgressEvent = {
  widgetId: string;
  step: "THINKING" | "ANALYZING" | "RENDERING" | "COMPLETED";
  message?: string;
  timestamp: string;
};

// ---- Chat ----
export type Citation = {
  datasetId: string;
  datasetName: string;
  field?: string;
  detail?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  widgetIds?: string[];
  citations?: Citation[];
  status?: "processing" | "completed" | "failed";
  timestamp?: string;
};

export type ChatThread = {
  id: string;
  messages: ChatMessage[];
};

// ---- Command Center ----
export type CommandCenterState = "IDLE" | "RUNNING" | "COMPLETED" | "FAILED";
export type AnalysisMode = "auto" | "manual";

// ---- Async UI States ----
export type AsyncStatus = "IDLE" | "LOADING" | "SUCCESS" | "PARTIAL" | "EMPTY" | "ERROR";

// ---- Agent Log ----
export type AgentLogEntry = {
  id: string;
  timestamp: string;
  step: string;
  message: string;
  widgetId?: string;
};

// ---- Semantics ----
export type SemanticTerm = {
  id: string;
  term: string;
  synonyms: string[];
  description?: string;
};

export type SemanticMeasure = {
  id: string;
  name: string;
  formula: string;
  datasetId: string;
  description?: string;
};

export type SemanticDimension = {
  id: string;
  name: string;
  datasetId: string;
  field: string;
  description?: string;
};

export type SemanticKPI = {
  id: string;
  name: string;
  formula: string;
  validationRule?: string;
  description?: string;
};

export type SemanticJoin = {
  id: string;
  fromDatasetId: string;
  toDatasetId: string;
  fromField: string;
  toField: string;
  joinType: "INNER" | "LEFT" | "RIGHT" | "FULL";
};

// ---- User ----
export type UserStatus = "ACTIVE" | "BLOCKED" | "PENDING";

export type User = {
  id: string;
  username: string;
  email: string;
  role: TenantRole;
  status: UserStatus;
  tenantId: string;
  createdAt?: string;
  lastLoginAt?: string;
};

// ---- Audit ----
export type AuditEvent = {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource?: string;
  detail?: string;
  tenantId: string;
};

// ---- Report ----
export type ReportElement = {
  widgetId: string;
  widgetName: string;
  nlQuery?: string;
  insight?: string;
};

export type Report = {
  id: string;
  name: string;
  tenantId: string;
  elements: ReportElement[];
  createdAt: string;
};

// ---- Sources ----
export type SourceLimits = {
  csvMax: number;
  dbmlMax: number;
  fileSizeMaxBytes: number;
  currentCsvCount: number;
  currentDbmlCount: number;
};

// ---- DBML ----
export type DbmlField = { name: string; type: string; isPrimary?: boolean; };
export type DbmlTable = { name: string; fields: DbmlField[]; };
export type DbmlRelation = { from: string; to: string; label?: string; };
export type DbmlSchema = { tables: DbmlTable[]; relations: DbmlRelation[]; };

// ---- Tenant Settings ----
export type TenantSettings = {
  tenantId: string;
  tenantName: string;
  [key: string]: unknown; // extensible
};
