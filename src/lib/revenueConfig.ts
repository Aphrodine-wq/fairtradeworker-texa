export interface RevenueConfig {
  affiliates: {
    enabled: boolean;
    materialsUrl?: string;
    toolsUrl?: string;
  };
  insurance: {
    enabled: boolean;
    referralUrl?: string;
    disclosure?: string;
  };
  financing: {
    enabled: boolean;
    referralUrl?: string;
    disclosure?: string;
  };
  premiumLead: {
    enabled: boolean;
    ctaUrl?: string;
    priceHint?: string;
  };
  donations: {
    enabled: boolean;
    donateUrl?: string;
  };
  apiAccess: {
    enabled: boolean;
    ctaUrl?: string;
  };
  toolsDirectory: {
    enabled: boolean;
    items: { name: string; description: string; url: string }[];
  };
}

export const revenueConfig: RevenueConfig = {
  affiliates: {
    enabled: process.env.FTW_REV_AFFILIATES_ENABLED !== 'false',
    materialsUrl: process.env.FTW_REV_MATERIALS_URL,
    toolsUrl: process.env.FTW_REV_TOOLS_URL,
  },
  insurance: {
    enabled: process.env.FTW_REV_INSURANCE_ENABLED !== 'false',
    referralUrl: process.env.FTW_REV_INSURANCE_URL,
    disclosure: 'Affiliate: may include referral compensation.',
  },
  financing: {
    enabled: process.env.FTW_REV_FINANCING_ENABLED !== 'false',
    referralUrl: process.env.FTW_REV_FINANCING_URL,
    disclosure: 'Affiliate: may include referral compensation.',
  },
  premiumLead: {
    enabled: process.env.FTW_REV_PREMIUM_LEAD_ENABLED !== 'false',
    ctaUrl: process.env.FTW_REV_PREMIUM_LEAD_URL,
    priceHint: '$10–$20 per premium lead (example)',
  },
  donations: {
    enabled: process.env.FTW_REV_DONATIONS_ENABLED !== 'false',
    donateUrl: process.env.FTW_REV_DONATE_URL,
  },
  apiAccess: {
    enabled: process.env.FTW_REV_API_ENABLED !== 'false',
    ctaUrl: process.env.FTW_REV_API_URL,
  },
  toolsDirectory: {
    enabled: process.env.FTW_REV_TOOLS_ENABLED !== 'false',
    items: [
      {
        name: 'Tool A',
        description: 'Project management for contractors.',
        url: process.env.FTW_REV_TOOL_A_URL || '#',
      },
      {
        name: 'Tool B',
        description: 'Scheduling and dispatch optimization.',
        url: process.env.FTW_REV_TOOL_B_URL || '#',
      },
    ],
  },
};
