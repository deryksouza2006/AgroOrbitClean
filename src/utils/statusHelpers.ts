import { theme } from '../constants/theme';

export function getFarmStatusColor(status: string): string {
  switch (status) {
    case 'HEALTHY': return theme.primary;
    case 'ATTENTION': return theme.yellow;
    case 'CRITICAL': return theme.red;
    default: return theme.textMuted;
  }
}

export function getFarmStatusLabel(status: string): string {
  switch (status) {
    case 'HEALTHY': return 'Saudável';
    case 'ATTENTION': return 'Atenção';
    case 'CRITICAL': return 'Crítico';
    default: return status;
  }
}

export function getCropAreaStatusColor(status: string): string {
  switch (status) {
    case 'HEALTHY': return theme.primary;
    case 'ATTENTION': return theme.yellow;
    case 'DROUGHT_RISK': return theme.orange;
    case 'CRITICAL': return theme.red;
    default: return theme.textMuted;
  }
}

export function getCropAreaStatusLabel(status: string): string {
  switch (status) {
    case 'HEALTHY': return 'Saudável';
    case 'ATTENTION': return 'Atenção';
    case 'DROUGHT_RISK': return 'Risco de seca';
    case 'CRITICAL': return 'Crítico';
    default: return status;
  }
}

export function getAlertStatusColor(status: string): string {
  switch (status) {
    case 'OPEN': return theme.red;
    case 'IN_ANALYSIS': return theme.blue;
    case 'RESOLVED': return theme.primary;
    default: return theme.textMuted;
  }
}

export function getAlertStatusLabel(status: string): string {
  switch (status) {
    case 'OPEN': return 'Aberto';
    case 'IN_ANALYSIS': return 'Em análise';
    case 'RESOLVED': return 'Resolvido';
    default: return status;
  }
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'LOW': return theme.primary;
    case 'MEDIUM': return theme.yellow;
    case 'HIGH': return theme.red;
    case 'CRITICAL': return '#7F1D1D';
    default: return theme.textMuted;
  }
}

export function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'LOW': return 'Baixa';
    case 'MEDIUM': return 'Média';
    case 'HIGH': return 'Alta';
    case 'CRITICAL': return 'Crítica';
    default: return severity;
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'LOW': return theme.primary;
    case 'MEDIUM': return theme.yellow;
    case 'HIGH': return theme.red;
    case 'URGENT': return theme.red;
    default: return theme.textMuted;
  }
}

export function getPriorityLabel(priority: string): string {
  switch (priority) {
    case 'LOW': return 'BAIXA';
    case 'MEDIUM': return 'ATENÇÃO';
    case 'HIGH': return 'ALTA';
    case 'URGENT': return 'URGENTE';
    default: return priority;
  }
}

export function getNdviColor(ndvi: number): string {
  if (ndvi >= 0.6) return theme.primary;
  if (ndvi >= 0.4) return theme.yellow;
  if (ndvi >= 0.2) return theme.orange;
  return theme.red;
}

export function getAreaUnitLabel(unit: string): string {
  switch (unit) {
    case 'ha': return 'Hectare';
    case 'm2': return 'm²';
    case 'acre': return 'Acre';
    default: return unit;
  }
}
