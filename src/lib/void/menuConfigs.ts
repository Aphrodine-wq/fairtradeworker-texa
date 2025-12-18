/**
 * VOID Menu Configurations - All 20 menu definitions
 */

import type { MenuConfig } from './types'

export const MENU_CONFIGS: MenuConfig[] = [
  {
    id: 'customers',
    label: 'Customers',
    icon: '👥',
    sections: {
      left: {
        title: 'All Customers',
        items: [
          { id: 'active', label: 'Active', action: 'view-customers-active' },
          { id: 'inactive', label: 'Inactive', action: 'view-customers-inactive' },
          { id: 'archived', label: 'Archived', action: 'view-customers-archived' },
          { id: 'recent', label: 'Recent', action: 'view-customers-recent' },
          { id: 'favorites', label: 'Favorites', action: 'view-customers-favorites' },
          { id: 'high-value', label: 'High Value', action: 'view-customers-high-value' },
        ],
      },
      middle: {
        title: 'Segments',
        items: [
          { id: 'vip', label: 'VIP Clients', action: 'view-customers-vip' },
          { id: 'residential', label: 'Residential', action: 'view-customers-residential' },
          { id: 'commercial', label: 'Commercial', action: 'view-customers-commercial' },
          { id: 'by-service', label: 'By Service', action: 'view-customers-by-service' },
          { id: 'by-location', label: 'By Location', action: 'view-customers-by-location' },
          { id: 'custom-tags', label: 'Custom Tags', action: 'view-customers-tags' },
        ],
      },
      right: {
        title: 'Actions',
        items: [
          { id: 'add', label: 'Add Customer', action: 'add-customer', icon: '➕' },
          { id: 'import', label: 'Import CSV', action: 'import-customers' },
          { id: 'export', label: 'Export Data', action: 'export-customers' },
          { id: 'bulk-edit', label: 'Bulk Edit', action: 'bulk-edit-customers' },
          { id: 'merge', label: 'Merge Dupes', action: 'merge-duplicates' },
          { id: 'campaign', label: 'Send Campaign', action: 'send-campaign' },
        ],
      },
    },
  },
  {
    id: 'leads',
    label: 'Leads',
    icon: '📊',
    sections: {
      left: {
        title: 'Lead Status',
        items: [
          { id: 'new', label: 'New', action: 'view-leads-new', badge: 12 },
          { id: 'contacted', label: 'Contacted', action: 'view-leads-contacted' },
          { id: 'qualified', label: 'Qualified', action: 'view-leads-qualified' },
          { id: 'proposal', label: 'Proposal Sent', action: 'view-leads-proposal' },
          { id: 'negotiating', label: 'Negotiating', action: 'view-leads-negotiating' },
          { id: 'won-lost', label: 'Won / Lost', action: 'view-leads-won-lost' },
        ],
      },
      middle: {
        title: 'Sources',
        items: [
          { id: 'website', label: 'Website', action: 'view-leads-website' },
          { id: 'referral', label: 'Referral', action: 'view-leads-referral' },
          { id: 'social', label: 'Social Media', action: 'view-leads-social' },
          { id: 'google-ads', label: 'Ads (Google)', action: 'view-leads-google-ads' },
          { id: 'meta-ads', label: 'Ads (Meta)', action: 'view-leads-meta-ads' },
          { id: 'marketplace', label: 'Marketplace', action: 'view-leads-marketplace' },
        ],
      },
      right: {
        title: 'Actions',
        items: [
          { id: 'add', label: 'Add Lead', action: 'add-lead', icon: '➕' },
          { id: 'voice', label: 'Voice Capture', action: 'voice-capture' },
          { id: 'import', label: 'Import Leads', action: 'import-leads' },
          { id: 'scoring', label: 'Lead Scoring', action: 'lead-scoring' },
          { id: 'auto-assign', label: 'Auto-Assign', action: 'auto-assign-leads' },
          { id: 'nurture', label: 'Nurture Flow', action: 'nurture-flow' },
        ],
      },
    },
  },
  {
    id: 'ai',
    label: 'AI',
    icon: '🤖',
    sections: {
      left: {
        title: 'Assistants',
        items: [
          { id: 'chat', label: 'Chat with AI', action: 'ai-chat' },
          { id: 'voice', label: 'Voice Capture', action: 'voice-capture' },
          { id: 'meeting-notes', label: 'Meeting Notes', action: 'ai-meeting-notes' },
          { id: 'call-summary', label: 'Call Summary', action: 'ai-call-summary' },
          { id: 'lead-scorer', label: 'Lead Scorer', action: 'ai-lead-scorer' },
          { id: 'forecaster', label: 'Forecaster', action: 'ai-forecaster' },
        ],
      },
      middle: {
        title: 'Tools',
        items: [
          { id: 'email-writer', label: 'Email Writer', action: 'ai-email-writer' },
          { id: 'proposal-gen', label: 'Proposal Gen', action: 'ai-proposal-gen' },
          { id: 'contract-draft', label: 'Contract Draft', action: 'ai-contract-draft' },
          { id: 'follow-up-gen', label: 'Follow-Up Gen', action: 'ai-follow-up-gen' },
          { id: 'price-estimator', label: 'Price Estimator', action: 'ai-price-estimator' },
          { id: 'report-builder', label: 'Report Builder', action: 'ai-report-builder' },
        ],
      },
      right: {
        title: 'Training',
        items: [
          { id: 'custom-prompts', label: 'Custom Prompts', action: 'ai-custom-prompts' },
          { id: 'brand-voice', label: 'Brand Voice', action: 'ai-brand-voice' },
          { id: 'response-bank', label: 'Response Bank', action: 'ai-response-bank' },
          { id: 'faq-training', label: 'FAQ Training', action: 'ai-faq-training' },
          { id: 'tone-settings', label: 'Tone Settings', action: 'ai-tone-settings' },
          { id: 'api-keys', label: 'API Keys', action: 'ai-api-keys' },
        ],
      },
    },
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: '⚡',
    sections: {
      left: {
        title: 'Triggers',
        items: [
          { id: 'new-lead', label: 'New Lead', action: 'automation-trigger-new-lead' },
          { id: 'status-change', label: 'Status Change', action: 'automation-trigger-status-change' },
          { id: 'inactivity', label: 'Inactivity', action: 'automation-trigger-inactivity' },
          { id: 'date-time', label: 'Date/Time', action: 'automation-trigger-date-time' },
          { id: 'form-submit', label: 'Form Submit', action: 'automation-trigger-form-submit' },
          { id: 'payment', label: 'Payment', action: 'automation-trigger-payment' },
        ],
      },
      middle: {
        title: 'Actions',
        items: [
          { id: 'send-email', label: 'Send Email', action: 'automation-action-send-email' },
          { id: 'send-sms', label: 'Send SMS', action: 'automation-action-send-sms' },
          { id: 'create-task', label: 'Create Task', action: 'automation-action-create-task' },
          { id: 'update-field', label: 'Update Field', action: 'automation-action-update-field' },
          { id: 'notify-team', label: 'Notify Team', action: 'automation-action-notify-team' },
          { id: 'move-pipeline', label: 'Move Pipeline', action: 'automation-action-move-pipeline' },
        ],
      },
      right: {
        title: 'Templates',
        items: [
          { id: 'welcome-series', label: 'Welcome Series', action: 'automation-template-welcome' },
          { id: 'follow-up', label: 'Follow-Up', action: 'automation-template-follow-up' },
          { id: 're-engagement', label: 'Re-Engagement', action: 'automation-template-re-engagement' },
          { id: 'review-request', label: 'Review Request', action: 'automation-template-review' },
          { id: 'quote-reminder', label: 'Quote Reminder', action: 'automation-template-quote' },
          { id: 'custom-builder', label: 'Custom Builder', action: 'automation-custom-builder' },
        ],
      },
    },
  },
  {
    id: 'integrations',
    label: 'Integrations',
    icon: '🔗',
    sections: {
      left: {
        title: 'Connected',
        items: [
          { id: 'spotify', label: 'Spotify ✓', action: 'integration-spotify' },
          { id: 'google-cal', label: 'Google Cal ✓', action: 'integration-google-cal' },
          { id: 'gmail', label: 'Gmail ✓', action: 'integration-gmail' },
          { id: 'slack', label: 'Slack', action: 'integration-slack' },
          { id: 'zoom', label: 'Zoom', action: 'integration-zoom' },
          { id: 'whatsapp', label: 'WhatsApp', action: 'integration-whatsapp' },
        ],
      },
      middle: {
        title: 'Available',
        items: [
          { id: 'quickbooks', label: 'QuickBooks', action: 'integration-quickbooks' },
          { id: 'stripe', label: 'Stripe', action: 'integration-stripe' },
          { id: 'twilio', label: 'Twilio', action: 'integration-twilio' },
          { id: 'mailchimp', label: 'Mailchimp', action: 'integration-mailchimp' },
          { id: 'docusign', label: 'DocuSign', action: 'integration-docusign' },
          { id: 'angi', label: 'Angi/HomeAdv', action: 'integration-angi' },
        ],
      },
      right: {
        title: 'Developer',
        items: [
          { id: 'api-access', label: 'API Access', action: 'integration-api-access' },
          { id: 'webhooks', label: 'Webhooks', action: 'integration-webhooks' },
          { id: 'zapier', label: 'Zapier', action: 'integration-zapier' },
          { id: 'make', label: 'Make.com', action: 'integration-make' },
          { id: 'custom-apps', label: 'Custom Apps', action: 'integration-custom-apps' },
          { id: 'oauth-setup', label: 'OAuth Setup', action: 'integration-oauth-setup' },
        ],
      },
    },
  },
  {
    id: 'sales',
    label: 'Sales',
    icon: '💰',
    sections: {
      left: {
        title: 'Deals',
        items: [
          { id: 'active', label: 'Active Deals', action: 'sales-active-deals' },
          { id: 'won-month', label: 'Won This Month', action: 'sales-won-month' },
          { id: 'lost', label: 'Lost Deals', action: 'sales-lost-deals' },
          { id: 'forecasted', label: 'Forecasted', action: 'sales-forecasted' },
          { id: 'by-rep', label: 'By Rep', action: 'sales-by-rep' },
          { id: 'by-service', label: 'By Service', action: 'sales-by-service' },
        ],
      },
      middle: {
        title: 'Quotes',
        items: [
          { id: 'create', label: 'Create Quote', action: 'sales-create-quote' },
          { id: 'templates', label: 'Templates', action: 'sales-quote-templates' },
          { id: 'pending', label: 'Pending', action: 'sales-quotes-pending' },
          { id: 'approved', label: 'Approved', action: 'sales-quotes-approved' },
          { id: 'expired', label: 'Expired', action: 'sales-quotes-expired' },
          { id: 'e-signatures', label: 'E-Signatures', action: 'sales-e-signatures' },
        ],
      },
      right: {
        title: 'Reports',
        items: [
          { id: 'revenue', label: 'Revenue', action: 'sales-report-revenue' },
          { id: 'conversion', label: 'Conversion', action: 'sales-report-conversion' },
          { id: 'avg-deal', label: 'Avg Deal Size', action: 'sales-report-avg-deal' },
          { id: 'sales-cycle', label: 'Sales Cycle', action: 'sales-report-cycle' },
          { id: 'win-loss', label: 'Win/Loss', action: 'sales-report-win-loss' },
          { id: 'leaderboard', label: 'Leaderboard', action: 'sales-leaderboard' },
        ],
      },
    },
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: '📈',
    sections: {
      left: {
        title: 'Views',
        items: [
          { id: 'kanban', label: 'Kanban Board', action: 'pipeline-view-kanban' },
          { id: 'list', label: 'List View', action: 'pipeline-view-list' },
          { id: 'calendar', label: 'Calendar View', action: 'pipeline-view-calendar' },
          { id: 'forecast', label: 'Forecast View', action: 'pipeline-view-forecast' },
          { id: 'team', label: 'Team View', action: 'pipeline-view-team' },
          { id: 'my', label: 'My Pipeline', action: 'pipeline-view-my' },
        ],
      },
      middle: {
        title: 'Stages',
        items: [
          { id: 'lead', label: 'Lead', action: 'pipeline-stage-lead' },
          { id: 'contacted', label: 'Contacted', action: 'pipeline-stage-contacted' },
          { id: 'quote-sent', label: 'Quote Sent', action: 'pipeline-stage-quote-sent' },
          { id: 'negotiation', label: 'Negotiation', action: 'pipeline-stage-negotiation' },
          { id: 'won', label: 'Won', action: 'pipeline-stage-won' },
          { id: 'lost', label: 'Lost', action: 'pipeline-stage-lost' },
        ],
      },
      right: {
        title: 'Settings',
        items: [
          { id: 'edit-stages', label: 'Edit Stages', action: 'pipeline-settings-edit-stages' },
          { id: 'probability', label: 'Probability %', action: 'pipeline-settings-probability' },
          { id: 'auto-move', label: 'Auto-Move', action: 'pipeline-settings-auto-move' },
          { id: 'notifications', label: 'Notifications', action: 'pipeline-settings-notifications' },
          { id: 'rot-alerts', label: 'Rot Alerts', action: 'pipeline-settings-rot-alerts' },
          { id: 'goals', label: 'Goals', action: 'pipeline-settings-goals' },
        ],
      },
    },
  },
  {
    id: 'social-media',
    label: 'Social Media',
    icon: '📱',
    sections: {
      left: {
        title: 'Accounts',
        items: [
          { id: 'instagram', label: 'Instagram', action: 'social-account-instagram' },
          { id: 'facebook', label: 'Facebook', action: 'social-account-facebook' },
          { id: 'tiktok', label: 'TikTok', action: 'social-account-tiktok' },
          { id: 'linkedin', label: 'LinkedIn', action: 'social-account-linkedin' },
          { id: 'youtube', label: 'YouTube', action: 'social-account-youtube' },
          { id: 'google-bus', label: 'Google Bus.', action: 'social-account-google-bus' },
        ],
      },
      middle: {
        title: 'Content',
        items: [
          { id: 'schedule', label: 'Schedule Post', action: 'social-schedule-post' },
          { id: 'queue', label: 'Content Queue', action: 'social-content-queue' },
          { id: 'ai-captions', label: 'AI Captions', action: 'social-ai-captions' },
          { id: 'media-library', label: 'Media Library', action: 'social-media-library' },
          { id: 'templates', label: 'Templates', action: 'social-templates' },
          { id: 'hashtag-bank', label: 'Hashtag Bank', action: 'social-hashtag-bank' },
        ],
      },
      right: {
        title: 'Analytics',
        items: [
          { id: 'engagement', label: 'Engagement', action: 'social-analytics-engagement' },
          { id: 'followers', label: 'Followers', action: 'social-analytics-followers' },
          { id: 'best-times', label: 'Best Times', action: 'social-analytics-best-times' },
          { id: 'top-posts', label: 'Top Posts', action: 'social-analytics-top-posts' },
          { id: 'competitors', label: 'Competitors', action: 'social-analytics-competitors' },
          { id: 'roi', label: 'ROI Tracking', action: 'social-analytics-roi' },
        ],
      },
    },
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: '📉',
    sections: {
      left: {
        title: 'Dashboards',
        items: [
          { id: 'overview', label: 'Overview', action: 'analytics-dashboard-overview' },
          { id: 'sales', label: 'Sales', action: 'analytics-dashboard-sales' },
          { id: 'marketing', label: 'Marketing', action: 'analytics-dashboard-marketing' },
          { id: 'team-perf', label: 'Team Perf', action: 'analytics-dashboard-team' },
          { id: 'customer-ltv', label: 'Customer LTV', action: 'analytics-dashboard-ltv' },
          { id: 'forecasting', label: 'Forecasting', action: 'analytics-dashboard-forecasting' },
        ],
      },
      middle: {
        title: 'Reports',
        items: [
          { id: 'sales-report', label: 'Sales Report', action: 'analytics-report-sales' },
          { id: 'lead-report', label: 'Lead Report', action: 'analytics-report-lead' },
          { id: 'activity-log', label: 'Activity Log', action: 'analytics-report-activity' },
          { id: 'custom-report', label: 'Custom Report', action: 'analytics-report-custom' },
          { id: 'comparisons', label: 'Comparisons', action: 'analytics-report-comparisons' },
          { id: 'goal-tracking', label: 'Goal Tracking', action: 'analytics-report-goals' },
        ],
      },
      right: {
        title: 'Export',
        items: [
          { id: 'pdf', label: 'PDF Export', action: 'analytics-export-pdf' },
          { id: 'csv', label: 'CSV Export', action: 'analytics-export-csv' },
          { id: 'scheduled', label: 'Scheduled', action: 'analytics-export-scheduled' },
          { id: 'email-reports', label: 'Email Reports', action: 'analytics-export-email' },
          { id: 'api-access', label: 'API Access', action: 'analytics-export-api' },
          { id: 'embeds', label: 'Embeds', action: 'analytics-export-embeds' },
        ],
      },
    },
  },
  {
    id: 'contacts',
    label: 'Contacts',
    icon: '👤',
    sections: {
      left: {
        title: 'People',
        items: [
          { id: 'all', label: 'All Contacts', action: 'contacts-people-all' },
          { id: 'customers', label: 'Customers', action: 'contacts-people-customers' },
          { id: 'vendors', label: 'Vendors', action: 'contacts-people-vendors' },
          { id: 'partners', label: 'Partners', action: 'contacts-people-partners' },
          { id: 'team', label: 'Team', action: 'contacts-people-team' },
          { id: 'favorites', label: 'Favorites', action: 'contacts-people-favorites' },
        ],
      },
      middle: {
        title: 'Companies',
        items: [
          { id: 'all-companies', label: 'All Companies', action: 'contacts-companies-all' },
          { id: 'vendors', label: 'Vendors', action: 'contacts-companies-vendors' },
          { id: 'partners', label: 'Partners', action: 'contacts-companies-partners' },
          { id: 'competitors', label: 'Competitors', action: 'contacts-companies-competitors' },
          { id: 'subcontractors', label: 'Subcontractors', action: 'contacts-companies-subcontractors' },
          { id: 'suppliers', label: 'Suppliers', action: 'contacts-companies-suppliers' },
        ],
      },
      right: {
        title: 'Tools',
        items: [
          { id: 'add', label: 'Add Contact', action: 'contacts-add', icon: '➕' },
          { id: 'import', label: 'Import', action: 'contacts-import' },
          { id: 'deduplicate', label: 'Deduplicate', action: 'contacts-deduplicate' },
          { id: 'enrich', label: 'Enrich Data', action: 'contacts-enrich' },
          { id: 'business-card', label: 'Business Card', action: 'contacts-business-card' },
          { id: 'scan', label: 'Scan', action: 'contacts-scan' },
        ],
      },
    },
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: '🔄',
    sections: {
      left: {
        title: 'My Workflows',
        items: [
          { id: 'active', label: 'Active', action: 'workflows-my-active' },
          { id: 'paused', label: 'Paused', action: 'workflows-my-paused' },
          { id: 'completed', label: 'Completed', action: 'workflows-my-completed' },
          { id: 'failed', label: 'Failed', action: 'workflows-my-failed' },
          { id: 'scheduled', label: 'Scheduled', action: 'workflows-my-scheduled' },
          { id: 'archive', label: 'Archive', action: 'workflows-my-archive' },
        ],
      },
      middle: {
        title: 'Templates',
        items: [
          { id: 'lead-nurture', label: 'Lead Nurture', action: 'workflows-template-lead-nurture' },
          { id: 'onboarding', label: 'Onboarding', action: 'workflows-template-onboarding' },
          { id: 'follow-up', label: 'Follow-Up', action: 'workflows-template-follow-up' },
          { id: 'review-request', label: 'Review Request', action: 'workflows-template-review' },
          { id: 'win-back', label: 'Win-Back', action: 'workflows-template-win-back' },
          { id: 'upsell', label: 'Upsell', action: 'workflows-template-upsell' },
        ],
      },
      right: {
        title: 'Build',
        items: [
          { id: 'visual-builder', label: 'Visual Builder', action: 'workflows-build-visual' },
          { id: 'logic-rules', label: 'Logic Rules', action: 'workflows-build-logic' },
          { id: 'conditions', label: 'Conditions', action: 'workflows-build-conditions' },
          { id: 'variables', label: 'Variables', action: 'workflows-build-variables' },
          { id: 'testing', label: 'Testing', action: 'workflows-build-testing' },
          { id: 'analytics', label: 'Analytics', action: 'workflows-build-analytics' },
        ],
      },
    },
  },
  {
    id: 'marketing',
    label: 'Marketing',
    icon: '📣',
    sections: {
      left: {
        title: 'Campaigns',
        items: [
          { id: 'active', label: 'Active', action: 'marketing-campaigns-active' },
          { id: 'scheduled', label: 'Scheduled', action: 'marketing-campaigns-scheduled' },
          { id: 'completed', label: 'Completed', action: 'marketing-campaigns-completed' },
          { id: 'ab-tests', label: 'A/B Tests', action: 'marketing-campaigns-ab-tests' },
          { id: 'templates', label: 'Templates', action: 'marketing-campaigns-templates' },
          { id: 'analytics', label: 'Analytics', action: 'marketing-campaigns-analytics' },
        ],
      },
      middle: {
        title: 'Channels',
        items: [
          { id: 'email', label: 'Email', action: 'marketing-channel-email' },
          { id: 'sms', label: 'SMS', action: 'marketing-channel-sms' },
          { id: 'direct-mail', label: 'Direct Mail', action: 'marketing-channel-direct-mail' },
          { id: 'ads', label: 'Ads', action: 'marketing-channel-ads' },
          { id: 'referral', label: 'Referral', action: 'marketing-channel-referral' },
          { id: 'events', label: 'Events', action: 'marketing-channel-events' },
        ],
      },
      right: {
        title: 'Assets',
        items: [
          { id: 'landing-pages', label: 'Landing Pages', action: 'marketing-assets-landing' },
          { id: 'forms', label: 'Forms', action: 'marketing-assets-forms' },
          { id: 'pop-ups', label: 'Pop-ups', action: 'marketing-assets-popups' },
          { id: 'media-library', label: 'Media Library', action: 'marketing-assets-media' },
          { id: 'brand-kit', label: 'Brand Kit', action: 'marketing-assets-brand-kit' },
          { id: 'qr-codes', label: 'QR Codes', action: 'marketing-assets-qr-codes' },
        ],
      },
    },
  },
  {
    id: 'email',
    label: 'Email',
    icon: '✉️',
    sections: {
      left: {
        title: 'Inbox',
        items: [
          { id: 'all-mail', label: 'All Mail', action: 'email-inbox-all' },
          { id: 'unread', label: 'Unread', action: 'email-inbox-unread', badge: 5 },
          { id: 'starred', label: 'Starred', action: 'email-inbox-starred' },
          { id: 'sent', label: 'Sent', action: 'email-inbox-sent' },
          { id: 'drafts', label: 'Drafts', action: 'email-inbox-drafts' },
          { id: 'archived', label: 'Archived', action: 'email-inbox-archived' },
        ],
      },
      middle: {
        title: 'Compose',
        items: [
          { id: 'new', label: 'New Email', action: 'email-compose-new', icon: '➕' },
          { id: 'templates', label: 'Templates', action: 'email-compose-templates' },
          { id: 'ai-assist', label: 'AI Assist', action: 'email-compose-ai' },
          { id: 'schedule', label: 'Schedule', action: 'email-compose-schedule' },
          { id: 'bulk-send', label: 'Bulk Send', action: 'email-compose-bulk' },
          { id: 'mail-merge', label: 'Mail Merge', action: 'email-compose-mail-merge' },
        ],
      },
      right: {
        title: 'Settings',
        items: [
          { id: 'connected', label: 'Connected', action: 'email-settings-connected' },
          { id: 'signatures', label: 'Signatures', action: 'email-settings-signatures' },
          { id: 'auto-replies', label: 'Auto-Replies', action: 'email-settings-auto-replies' },
          { id: 'tracking', label: 'Tracking', action: 'email-settings-tracking' },
          { id: 'domains', label: 'Domains', action: 'email-settings-domains' },
          { id: 'smtp-setup', label: 'SMTP Setup', action: 'email-settings-smtp' },
        ],
      },
    },
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: '💳',
    sections: {
      left: {
        title: 'Invoices',
        items: [
          { id: 'create', label: 'Create Invoice', action: 'billing-invoices-create', icon: '➕' },
          { id: 'outstanding', label: 'Outstanding', action: 'billing-invoices-outstanding' },
          { id: 'paid', label: 'Paid', action: 'billing-invoices-paid' },
          { id: 'overdue', label: 'Overdue', action: 'billing-invoices-overdue' },
          { id: 'recurring', label: 'Recurring', action: 'billing-invoices-recurring' },
          { id: 'estimates', label: 'Estimates', action: 'billing-invoices-estimates' },
        ],
      },
      middle: {
        title: 'Payments',
        items: [
          { id: 'received', label: 'Received', action: 'billing-payments-received' },
          { id: 'pending', label: 'Pending', action: 'billing-payments-pending' },
          { id: 'failed', label: 'Failed', action: 'billing-payments-failed' },
          { id: 'refunds', label: 'Refunds', action: 'billing-payments-refunds' },
          { id: 'subscriptions', label: 'Subscriptions', action: 'billing-payments-subscriptions' },
          { id: 'deposits', label: 'Deposits', action: 'billing-payments-deposits' },
        ],
      },
      right: {
        title: 'Settings',
        items: [
          { id: 'payment-links', label: 'Payment Links', action: 'billing-settings-payment-links' },
          { id: 'tax-settings', label: 'Tax Settings', action: 'billing-settings-tax' },
          { id: 'late-fees', label: 'Late Fees', action: 'billing-settings-late-fees' },
          { id: 'reminders', label: 'Reminders', action: 'billing-settings-reminders' },
          { id: 'gateways', label: 'Gateways', action: 'billing-settings-gateways' },
          { id: 'reports', label: 'Reports', action: 'billing-settings-reports' },
        ],
      },
    },
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: '📄',
    sections: {
      left: {
        title: 'Library',
        items: [
          { id: 'all-files', label: 'All Files', action: 'documents-library-all' },
          { id: 'contracts', label: 'Contracts', action: 'documents-library-contracts' },
          { id: 'proposals', label: 'Proposals', action: 'documents-library-proposals' },
          { id: 'photos-media', label: 'Photos/Media', action: 'documents-library-photos' },
          { id: 'permits', label: 'Permits', action: 'documents-library-permits' },
          { id: 'insurance', label: 'Insurance', action: 'documents-library-insurance' },
        ],
      },
      middle: {
        title: 'Templates',
        items: [
          { id: 'contracts', label: 'Contracts', action: 'documents-templates-contracts' },
          { id: 'proposals', label: 'Proposals', action: 'documents-templates-proposals' },
          { id: 'estimates', label: 'Estimates', action: 'documents-templates-estimates' },
          { id: 'agreements', label: 'Agreements', action: 'documents-templates-agreements' },
          { id: 'invoices', label: 'Invoices', action: 'documents-templates-invoices' },
          { id: 'letters', label: 'Letters', action: 'documents-templates-letters' },
        ],
      },
      right: {
        title: 'Tools',
        items: [
          { id: 'upload', label: 'Upload', action: 'documents-tools-upload', icon: '➕' },
          { id: 'create-doc', label: 'Create Doc', action: 'documents-tools-create' },
          { id: 'e-signature', label: 'E-Signature', action: 'documents-tools-e-signature' },
          { id: 'version-hist', label: 'Version Hist', action: 'documents-tools-version' },
          { id: 'share-link', label: 'Share Link', action: 'documents-tools-share' },
          { id: 'scan-pdf', label: 'Scan to PDF', action: 'documents-tools-scan' },
        ],
      },
    },
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: '📆',
    sections: {
      left: {
        title: 'Views',
        items: [
          { id: 'day', label: 'Day', action: 'calendar-view-day' },
          { id: 'week', label: 'Week', action: 'calendar-view-week' },
          { id: 'month', label: 'Month', action: 'calendar-view-month' },
          { id: 'agenda', label: 'Agenda', action: 'calendar-view-agenda' },
          { id: 'team', label: 'Team', action: 'calendar-view-team' },
          { id: 'jobs-board', label: 'Jobs Board', action: 'calendar-view-jobs-board' },
        ],
      },
      middle: {
        title: 'Create',
        items: [
          { id: 'appointment', label: 'Appointment', action: 'calendar-create-appointment', icon: '➕' },
          { id: 'job-project', label: 'Job/Project', action: 'calendar-create-job' },
          { id: 'reminder', label: 'Reminder', action: 'calendar-create-reminder' },
          { id: 'follow-up', label: 'Follow-Up', action: 'calendar-create-follow-up' },
          { id: 'block-time', label: 'Block Time', action: 'calendar-create-block' },
          { id: 'recurring', label: 'Recurring', action: 'calendar-create-recurring' },
        ],
      },
      right: {
        title: 'Tools',
        items: [
          { id: 'booking-page', label: 'Booking Page', action: 'calendar-tools-booking' },
          { id: 'availability', label: 'Availability', action: 'calendar-tools-availability' },
          { id: 'team-schedule', label: 'Team Schedule', action: 'calendar-tools-team' },
          { id: 'route-planner', label: 'Route Planner', action: 'calendar-tools-route' },
          { id: 'sync-settings', label: 'Sync Settings', action: 'calendar-tools-sync' },
          { id: 'notifications', label: 'Notifications', action: 'calendar-tools-notifications' },
        ],
      },
    },
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    icon: '🛒',
    sections: {
      left: {
        title: 'Browse',
        items: [
          { id: 'featured', label: 'Featured', action: 'marketplace-browse-featured' },
          { id: 'new', label: 'New', action: 'marketplace-browse-new' },
          { id: 'popular', label: 'Popular', action: 'marketplace-browse-popular' },
          { id: 'free', label: 'Free', action: 'marketplace-browse-free' },
          { id: 'paid', label: 'Paid', action: 'marketplace-browse-paid' },
          { id: 'themes', label: 'Themes', action: 'marketplace-browse-themes' },
        ],
      },
      middle: {
        title: 'Categories',
        items: [
          { id: 'productivity', label: 'Productivity', action: 'marketplace-category-productivity' },
          { id: 'finance', label: 'Finance', action: 'marketplace-category-finance' },
          { id: 'marketing', label: 'Marketing', action: 'marketplace-category-marketing' },
          { id: 'operations', label: 'Operations', action: 'marketplace-category-operations' },
          { id: 'industry', label: 'Industry', action: 'marketplace-category-industry' },
          { id: 'analytics', label: 'Analytics', action: 'marketplace-category-analytics' },
        ],
      },
      right: {
        title: 'My Apps',
        items: [
          { id: 'installed', label: 'Installed', action: 'marketplace-my-installed' },
          { id: 'updates', label: 'Updates', action: 'marketplace-my-updates' },
          { id: 'purchased', label: 'Purchased', action: 'marketplace-my-purchased' },
          { id: 'subscriptions', label: 'Subscriptions', action: 'marketplace-my-subscriptions' },
          { id: 'reviews', label: 'Reviews', action: 'marketplace-my-reviews' },
          { id: 'submit-app', label: 'Submit App', action: 'marketplace-submit-app' },
        ],
      },
    },
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: '⚙️',
    sections: {
      left: {
        title: 'Account',
        items: [
          { id: 'profile', label: 'Profile', action: 'settings-account-profile' },
          { id: 'security', label: 'Security', action: 'settings-account-security' },
          { id: 'notifications', label: 'Notifications', action: 'settings-account-notifications' },
          { id: 'connected', label: 'Connected', action: 'settings-account-connected' },
          { id: 'billing-plan', label: 'Billing Plan', action: 'settings-account-billing' },
          { id: 'data-export', label: 'Data Export', action: 'settings-account-export' },
        ],
      },
      middle: {
        title: 'Workspace',
        items: [
          { id: 'team-members', label: 'Team Members', action: 'settings-workspace-team' },
          { id: 'roles-perms', label: 'Roles/Perms', action: 'settings-workspace-roles' },
          { id: 'branding', label: 'Branding', action: 'settings-workspace-branding' },
          { id: 'custom-fields', label: 'Custom Fields', action: 'settings-workspace-custom-fields' },
          { id: 'tags-labels', label: 'Tags/Labels', action: 'settings-workspace-tags' },
          { id: 'templates', label: 'Templates', action: 'settings-workspace-templates' },
        ],
      },
      right: {
        title: 'System',
        items: [
          { id: 'background', label: 'Background', action: 'settings-system-background' },
          { id: 'theme', label: 'Theme', action: 'settings-system-theme' },
          { id: 'desktop-layout', label: 'Desktop Layout', action: 'settings-system-desktop-layout' },
          { id: 'shortcuts', label: 'Shortcuts', action: 'settings-system-shortcuts' },
          { id: 'language', label: 'Language', action: 'settings-system-language' },
          { id: 'backup', label: 'Backup', action: 'settings-system-backup' },
        ],
      },
    },
  },
  {
    id: 'support',
    label: 'Support',
    icon: '❓',
    sections: {
      left: {
        title: 'Help Center',
        items: [
          { id: 'getting-started', label: 'Getting Started', action: 'support-help-getting-started' },
          { id: 'faqs', label: 'FAQs', action: 'support-help-faqs' },
          { id: 'search-docs', label: 'Search Docs', action: 'support-help-search-docs' },
          { id: 'whats-new', label: "What's New", action: 'support-help-whats-new' },
          { id: 'tips-tricks', label: 'Tips & Tricks', action: 'support-help-tips' },
          { id: 'keyboard-short', label: 'Keyboard Short', action: 'support-help-keyboard' },
        ],
      },
      middle: {
        title: 'Contact',
        items: [
          { id: 'live-chat', label: 'Live Chat', action: 'support-contact-live-chat' },
          { id: 'email-support', label: 'Email Support', action: 'support-contact-email' },
          { id: 'call-us', label: 'Call Us', action: 'support-contact-call' },
          { id: 'bug-report', label: 'Bug Report', action: 'support-contact-bug' },
          { id: 'feature-req', label: 'Feature Req', action: 'support-contact-feature' },
          { id: 'status-page', label: 'Status Page', action: 'support-contact-status' },
        ],
      },
      right: {
        title: 'Resources',
        items: [
          { id: 'video-tutorials', label: 'Video Tutorials', action: 'support-resources-videos' },
          { id: 'webinars', label: 'Webinars', action: 'support-resources-webinars' },
          { id: 'community', label: 'Community', action: 'support-resources-community' },
          { id: 'api-docs', label: 'API Docs', action: 'support-resources-api' },
          { id: 'changelog', label: 'Changelog', action: 'support-resources-changelog' },
          { id: 'blog', label: 'Blog', action: 'support-resources-blog' },
        ],
      },
    },
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: '🎤',
    sections: {
      left: {
        title: 'Voice Actions',
        items: [
          { id: 'voice-capture', label: 'Voice Capture', action: 'voice-capture' },
          { id: 'voice-notes', label: 'Voice Notes', action: 'voice-notes' },
          { id: 'voice-commands', label: 'Voice Commands', action: 'voice-commands' },
          { id: 'voice-transcribe', label: 'Voice Transcribe', action: 'voice-transcribe' },
          { id: 'voice-search', label: 'Voice Search', action: 'voice-search' },
          { id: 'voice-settings', label: 'Voice Settings', action: 'voice-settings' },
        ],
      },
      middle: {
        title: 'Recordings',
        items: [
          { id: 'recent', label: 'Recent', action: 'voice-recordings-recent' },
          { id: 'all', label: 'All', action: 'voice-recordings-all' },
          { id: 'favorites', label: 'Favorites', action: 'voice-recordings-favorites' },
          { id: 'transcribed', label: 'Transcribed', action: 'voice-recordings-transcribed' },
          { id: 'pending', label: 'Pending', action: 'voice-recordings-pending' },
          { id: 'archived', label: 'Archived', action: 'voice-recordings-archived' },
        ],
      },
      right: {
        title: 'Tools',
        items: [
          { id: 'start-recording', label: 'Start Recording', action: 'voice-tools-start', icon: '🎤' },
          { id: 'import-audio', label: 'Import Audio', action: 'voice-tools-import' },
          { id: 'export-audio', label: 'Export Audio', action: 'voice-tools-export' },
          { id: 'audio-settings', label: 'Audio Settings', action: 'voice-tools-audio-settings' },
          { id: 'transcription-settings', label: 'Transcription Settings', action: 'voice-tools-transcription' },
          { id: 'voice-ai-settings', label: 'Voice AI Settings', action: 'voice-tools-ai-settings' },
        ],
      },
    },
  },
]
