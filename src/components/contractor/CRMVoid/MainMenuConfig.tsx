import { Briefcase, UsersThree, UserPlus, Brain, Building, Crown, Microphone, List, FileText, ArrowsClockwise, ChartBar, Export, Gear } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export type MainMenuId = 'jobs' | 'teams' | 'customer-intake' | 'ai' | 'office' | 'pro-tools' | 'leads'

export interface SubMenuItem {
  id: string
  label: string
  icon: ReactNode
  page: string
}

export interface MainMenuConfig {
  id: MainMenuId
  label: string
  icon: typeof Briefcase
  color: string
  bgColor: string
  borderColor: string
  subMenus: SubMenuItem[]
}

export const MAIN_MENU_CONFIGS: MainMenuConfig[] = [
  {
    id: 'jobs',
    label: 'Job',
    icon: Briefcase,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'browse-jobs', label: 'Browse Jobs', icon: <Briefcase size={20} />, page: 'browse-jobs' },
      { id: 'post-job', label: 'Post Job', icon: <Briefcase size={20} />, page: 'unified-post-job' },
      { id: 'my-jobs', label: 'My Jobs', icon: <Briefcase size={20} />, page: 'my-jobs' },
      { id: 'bid-management', label: 'Bid Management', icon: <Briefcase size={20} />, page: 'browse-jobs' },
      { id: 'job-analytics', label: 'Job Analytics', icon: <Briefcase size={20} />, page: 'browse-jobs' },
      { id: 'route-builder', label: 'Route Builder', icon: <Briefcase size={20} />, page: 'route-builder' },
      { id: 'job-calendar', label: 'Job Calendar', icon: <Briefcase size={20} />, page: 'calendar' },
      { id: 'find-opportunities', label: 'Find Opportunities', icon: <Briefcase size={20} />, page: 'find-opportunities' },
    ],
  },
  {
    id: 'teams',
    label: 'Teams',
    icon: UsersThree,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'crew-dispatcher', label: 'Crew Dispatcher', icon: <UsersThree size={20} />, page: 'crew-dispatcher' },
      { id: 'team-calendar', label: 'Team Calendar', icon: <UsersThree size={20} />, page: 'calendar' },
      { id: 'collaboration-hub', label: 'Collaboration Hub', icon: <UsersThree size={20} />, page: 'communication' },
      { id: 'task-assignment', label: 'Task Assignment', icon: <UsersThree size={20} />, page: 'dashboard' },
      { id: 'team-analytics', label: 'Team Analytics', icon: <UsersThree size={20} />, page: 'revenue-dashboard' },
      { id: 'communication', label: 'Communication', icon: <UsersThree size={20} />, page: 'communication' },
      { id: 'skill-trading', label: 'Skill Trading', icon: <UsersThree size={20} />, page: 'skill-trading' },
      { id: 'team-settings', label: 'Team Settings', icon: <UsersThree size={20} />, page: 'settings' },
    ],
  },
  {
    id: 'customer-intake',
    label: 'Customer Intake',
    icon: UserPlus,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'import-customer-data', label: 'Import Customer Data', icon: <Microphone size={20} />, page: 'voice-intake' },
      { id: 'add-customer', label: 'Add Customer', icon: <UserPlus size={20} />, page: 'customer-crm' },
      { id: 'customer-list', label: 'Customer List', icon: <UserPlus size={20} />, page: 'customer-crm' },
      { id: 'crm-pipeline', label: 'CRM Pipeline', icon: <UserPlus size={20} />, page: 'crm' },
      { id: 'customer-analytics', label: 'Customer Analytics', icon: <UserPlus size={20} />, page: 'customer-crm' },
      { id: 'follow-up-sequences', label: 'Follow-up Sequences', icon: <UserPlus size={20} />, page: 'customer-crm' },
      { id: 'lead-management', label: 'Lead Management', icon: <UserPlus size={20} />, page: 'leads' },
      { id: 'relationship-tracking', label: 'Relationship Tracking', icon: <UserPlus size={20} />, page: 'customer-crm' },
    ],
  },
  {
    id: 'ai',
    label: 'AI',
    icon: Brain,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'ai-scoping', label: 'AI Scoping', icon: <Brain size={20} />, page: 'photo-scoper' },
      { id: 'bid-intelligence', label: 'Bid Intelligence', icon: <Brain size={20} />, page: 'browse-jobs' },
      { id: 'smart-replies', label: 'Smart Replies', icon: <Brain size={20} />, page: 'smart-replies' },
      { id: 'ai-insights', label: 'AI Insights', icon: <Brain size={20} />, page: 'customer-crm' },
      { id: 'voice-assistant', label: 'Voice Assistant', icon: <Brain size={20} />, page: 'crm' },
      { id: 'auto-categorization', label: 'Auto Categorization', icon: <Brain size={20} />, page: 'customer-crm' },
      { id: 'predictive-analytics', label: 'Predictive Analytics', icon: <Brain size={20} />, page: 'revenue-dashboard' },
      { id: 'ai-receptionist', label: 'AI Receptionist', icon: <Brain size={20} />, page: 'receptionist-crm' },
    ],
  },
  {
    id: 'office',
    label: 'Office',
    icon: Building,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'document-manager', label: 'Document Manager', icon: <Building size={20} />, page: 'documents' },
      { id: 'invoice-manager', label: 'Invoice Manager', icon: <Building size={20} />, page: 'invoices-page' },
      { id: 'expense-tracking', label: 'Expense Tracking', icon: <Building size={20} />, page: 'expenses' },
      { id: 'calendar-sync', label: 'Calendar Sync', icon: <Building size={20} />, page: 'calendar-sync' },
      { id: 'client-portal', label: 'Client Portal', icon: <Building size={20} />, page: 'client-portal' },
      { id: 'compliance-tracker', label: 'Compliance Tracker', icon: <Building size={20} />, page: 'compliance' },
      { id: 'quality-assurance', label: 'Quality Assurance', icon: <Building size={20} />, page: 'quality' },
      { id: 'tax-helper', label: 'Tax Helper', icon: <Building size={20} />, page: 'tax-helper' },
    ],
  },
  {
    id: 'pro-tools',
    label: 'Pro Tools',
    icon: Crown,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'advanced-analytics', label: 'Advanced Analytics', icon: <Crown size={20} />, page: 'revenue-dashboard' },
      { id: 'custom-branding', label: 'Custom Branding', icon: <Crown size={20} />, page: 'custom-branding' },
      { id: 'priority-support', label: 'Priority Support', icon: <Crown size={20} />, page: 'pro-support-chat' },
      { id: 'export-everything', label: 'Export Everything', icon: <Crown size={20} />, page: 'export-everything' },
      { id: 'advanced-workflows', label: 'Advanced Workflows', icon: <Crown size={20} />, page: 'workflow-automation' },
      { id: 'pro-support-chat', label: 'Pro Support Chat', icon: <Crown size={20} />, page: 'pro-support-chat' },
      { id: 'priority-job-alerts', label: 'Priority Job Alerts', icon: <Crown size={20} />, page: 'priority-job-alerts' },
      { id: 'advanced-crm', label: 'Advanced CRM', icon: <Crown size={20} />, page: 'customer-crm' },
    ],
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: Microphone,
    color: 'text-black dark:text-white',
    bgColor: 'bg-white dark:bg-black',
    borderColor: 'border-black dark:border-white',
    subMenus: [
      { id: 'quick-capture', label: 'Quick Capture', icon: <Microphone size={20} />, page: 'lead-capture' },
      { id: 'manual-entry', label: 'Manual Entry', icon: <FileText size={20} />, page: 'lead-capture' },
      { id: 'view-leads', label: 'View Captured Leads', icon: <List size={20} />, page: 'lead-capture' },
      { id: 'sync-crm', label: 'Sync to CRM', icon: <ArrowsClockwise size={20} />, page: 'lead-capture' },
      { id: 'lead-templates', label: 'Lead Templates', icon: <FileText size={20} />, page: 'lead-capture' },
      { id: 'lead-analytics', label: 'Lead Analytics', icon: <ChartBar size={20} />, page: 'lead-capture' },
      { id: 'export-leads', label: 'Export Leads', icon: <Export size={20} />, page: 'lead-capture' },
      { id: 'lead-settings', label: 'Lead Settings', icon: <Gear size={20} />, page: 'lead-capture' },
    ],
  },
]
