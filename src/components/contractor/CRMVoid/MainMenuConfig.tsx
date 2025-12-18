import { 
  Briefcase, UsersThree, UserPlus, Brain, Building, Crown, Microphone,
  MagnifyingGlass, Plus, Folder, Handshake, ChartBar, MapPin, CalendarBlank, Compass,
  Calendar, ChatCircle, Task, TrendUp, Users, Gear,
  List, Funnel, ChartLine, Envelope, Phone, FileText,
  Camera, Sparkle, ChatText, Robot, Tag, ChartPie,
  FilePdf, Receipt, Wallet, CalendarCheck, Globe, Shield, Clipboard, Calculator
} from '@phosphor-icons/react'
import type { ReactNode } from 'react'

export type MainMenuId = 'jobs' | 'teams' | 'customer-intake' | 'ai' | 'office' | 'pro-tools'

export type SubMenuSize = 'important' | 'standard' | 'secondary'

export interface SubMenuItem {
  id: string
  label: string
  icon: ReactNode
  page: string
  size?: SubMenuSize
  tooltip?: string
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
      { id: 'browse-jobs', label: 'Browse Jobs', icon: <MagnifyingGlass size={20} />, page: 'browse-jobs', size: 'important', tooltip: 'Search and browse available job opportunities' },
      { id: 'post-job', label: 'Post Job', icon: <Plus size={20} />, page: 'unified-post-job', size: 'important', tooltip: 'Create and post a new job listing' },
      { id: 'my-jobs', label: 'My Jobs', icon: <Folder size={20} />, page: 'my-jobs', size: 'standard', tooltip: 'View and manage your active jobs' },
      { id: 'bid-management', label: 'Bid Management', icon: <Handshake size={20} />, page: 'browse-jobs', size: 'standard', tooltip: 'Manage your bids and proposals' },
      { id: 'job-analytics', label: 'Job Analytics', icon: <ChartBar size={20} />, page: 'browse-jobs', size: 'standard', tooltip: 'View job performance analytics and insights' },
      { id: 'route-builder', label: 'Route Builder', icon: <MapPin size={20} />, page: 'route-builder', size: 'standard', tooltip: 'Plan and optimize job routes' },
      { id: 'job-calendar', label: 'Job Calendar', icon: <CalendarBlank size={20} />, page: 'calendar', size: 'secondary', tooltip: 'View jobs in calendar format' },
      { id: 'find-opportunities', label: 'Find Opportunities', icon: <Compass size={20} />, page: 'find-opportunities', size: 'secondary', tooltip: 'Discover new job opportunities' },
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
      { id: 'crew-dispatcher', label: 'Crew Dispatcher', icon: <UsersThree size={20} />, page: 'crew-dispatcher', size: 'important', tooltip: 'Dispatch and manage crew assignments' },
      { id: 'team-calendar', label: 'Team Calendar', icon: <Calendar size={20} />, page: 'calendar', size: 'important', tooltip: 'View team schedules and availability' },
      { id: 'collaboration-hub', label: 'Collaboration Hub', icon: <ChatCircle size={20} />, page: 'communication', size: 'standard', tooltip: 'Team collaboration and communication center' },
      { id: 'task-assignment', label: 'Task Assignment', icon: <Task size={20} />, page: 'dashboard', size: 'standard', tooltip: 'Assign and track team tasks' },
      { id: 'team-analytics', label: 'Team Analytics', icon: <TrendUp size={20} />, page: 'revenue-dashboard', size: 'standard', tooltip: 'Team performance analytics and metrics' },
      { id: 'communication', label: 'Communication', icon: <ChatText size={20} />, page: 'communication', size: 'standard', tooltip: 'Team messaging and communication tools' },
      { id: 'skill-trading', label: 'Skill Trading', icon: <Handshake size={20} />, page: 'skill-trading', size: 'secondary', tooltip: 'Trade skills with other contractors' },
      { id: 'team-settings', label: 'Team Settings', icon: <Gear size={20} />, page: 'settings', size: 'secondary', tooltip: 'Configure team settings and preferences' },
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
      { id: 'import-customer-data', label: 'Import Customer Data', icon: <Microphone size={20} />, page: 'voice-intake', size: 'important', tooltip: 'Import customer data via voice or text input' },
      { id: 'add-customer', label: 'Add Customer', icon: <UserPlus size={20} />, page: 'customer-crm', size: 'important', tooltip: 'Manually add a new customer to your CRM' },
      { id: 'customer-list', label: 'Customer List', icon: <List size={20} />, page: 'customer-crm', size: 'standard', tooltip: 'View and manage your customer database' },
      { id: 'crm-pipeline', label: 'CRM Pipeline', icon: <Funnel size={20} />, page: 'crm', size: 'standard', tooltip: 'Manage customer pipeline and sales stages' },
      { id: 'customer-analytics', label: 'Customer Analytics', icon: <ChartLine size={20} />, page: 'customer-crm', size: 'standard', tooltip: 'Customer insights and analytics dashboard' },
      { id: 'follow-up-sequences', label: 'Follow-up Sequences', icon: <Envelope size={20} />, page: 'customer-crm', size: 'standard', tooltip: 'Automated follow-up email sequences' },
      { id: 'lead-management', label: 'Lead Management', icon: <Phone size={20} />, page: 'leads', size: 'secondary', tooltip: 'Track and manage leads' },
      { id: 'relationship-tracking', label: 'Relationship Tracking', icon: <Users size={20} />, page: 'customer-crm', size: 'secondary', tooltip: 'Track customer relationships and interactions' },
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
      { id: 'ai-scoping', label: 'AI Scoping', icon: <Camera size={20} />, page: 'photo-scoper', size: 'important', tooltip: 'AI-powered photo analysis and job scoping' },
      { id: 'bid-intelligence', label: 'Bid Intelligence', icon: <Sparkle size={20} />, page: 'browse-jobs', size: 'important', tooltip: 'AI-powered bid recommendations and insights' },
      { id: 'smart-replies', label: 'Smart Replies', icon: <ChatText size={20} />, page: 'smart-replies', size: 'standard', tooltip: 'AI-generated smart reply suggestions' },
      { id: 'ai-insights', label: 'AI Insights', icon: <Brain size={20} />, page: 'customer-crm', size: 'standard', tooltip: 'AI-generated business insights and recommendations' },
      { id: 'voice-assistant', label: 'Voice Assistant', icon: <Microphone size={20} />, page: 'crm', size: 'standard', tooltip: 'Voice-activated AI assistant' },
      { id: 'auto-categorization', label: 'Auto Categorization', icon: <Tag size={20} />, page: 'customer-crm', size: 'standard', tooltip: 'Automatically categorize and tag items' },
      { id: 'predictive-analytics', label: 'Predictive Analytics', icon: <ChartPie size={20} />, page: 'revenue-dashboard', size: 'secondary', tooltip: 'Predictive analytics and forecasting' },
      { id: 'ai-receptionist', label: 'AI Receptionist', icon: <Robot size={20} />, page: 'receptionist-crm', size: 'secondary', tooltip: 'AI-powered virtual receptionist' },
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
      { id: 'document-manager', label: 'Document Manager', icon: <FileText size={20} />, page: 'documents', size: 'important', tooltip: 'Manage and organize business documents' },
      { id: 'invoice-manager', label: 'Invoice Manager', icon: <Receipt size={20} />, page: 'invoices-page', size: 'important', tooltip: 'Create, send, and track invoices' },
      { id: 'expense-tracking', label: 'Expense Tracking', icon: <Wallet size={20} />, page: 'expenses', size: 'standard', tooltip: 'Track business expenses and receipts' },
      { id: 'calendar-sync', label: 'Calendar Sync', icon: <CalendarCheck size={20} />, page: 'calendar-sync', size: 'standard', tooltip: 'Sync with external calendars' },
      { id: 'client-portal', label: 'Client Portal', icon: <Globe size={20} />, page: 'client-portal', size: 'standard', tooltip: 'Client-facing portal and dashboard' },
      { id: 'compliance-tracker', label: 'Compliance Tracker', icon: <Shield size={20} />, page: 'compliance', size: 'standard', tooltip: 'Track compliance requirements and certifications' },
      { id: 'quality-assurance', label: 'Quality Assurance', icon: <Clipboard size={20} />, page: 'quality', size: 'secondary', tooltip: 'Quality assurance and inspection tools' },
      { id: 'tax-helper', label: 'Tax Helper', icon: <Calculator size={20} />, page: 'tax-helper', size: 'secondary', tooltip: 'Tax calculation and preparation tools' },
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
      { id: 'advanced-analytics', label: 'Advanced Analytics', icon: <ChartBar size={20} />, page: 'revenue-dashboard', size: 'important', tooltip: 'Advanced business analytics and reporting' },
      { id: 'custom-branding', label: 'Custom Branding', icon: <Sparkle size={20} />, page: 'custom-branding', size: 'important', tooltip: 'Customize your brand and white-label features' },
      { id: 'priority-support', label: 'Priority Support', icon: <Crown size={20} />, page: 'pro-support-chat', size: 'standard', tooltip: 'Priority customer support access' },
      { id: 'export-everything', label: 'Export Everything', icon: <FilePdf size={20} />, page: 'export-everything', size: 'standard', tooltip: 'Export all your data and reports' },
      { id: 'advanced-workflows', label: 'Advanced Workflows', icon: <Task size={20} />, page: 'workflow-automation', size: 'standard', tooltip: 'Create and manage advanced automation workflows' },
      { id: 'pro-support-chat', label: 'Pro Support Chat', icon: <ChatCircle size={20} />, page: 'pro-support-chat', size: 'standard', tooltip: 'Direct chat with Pro support team' },
      { id: 'priority-job-alerts', label: 'Priority Job Alerts', icon: <Compass size={20} />, page: 'priority-job-alerts', size: 'secondary', tooltip: 'Get priority notifications for new jobs' },
      { id: 'advanced-crm', label: 'Advanced CRM', icon: <Users size={20} />, page: 'customer-crm', size: 'secondary', tooltip: 'Advanced CRM features and customization' },
    ],
  },
]
