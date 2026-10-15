export const ROLE_HELP_DEFAULTS = {
  GLOBAL: {
    title: 'Platform Help & Documentation',
    summary: 'Central knowledge base, system operating manuals, emergency hotlines, and video walkthroughs.',
    historyPath: null,
    contact: {
      theme: 'dark',
      badge: 'Central Helpdesk 24/7',
      title: 'support@vmovexa.com / 1800-VMOVEXA',
      description: 'Global 24/7 platform support desk for hardware, dispatch, and system inquiries.',
      ctaText: 'Open Ticket',
      actionAlert: 'Connecting to Central Platform Helpdesk...',
    },
    guides: [
      { title: 'Platform Onboarding', desc: 'System navigation & security setup', icon: 'Document' },
      { title: 'Hardware Binding Guide', desc: 'IoT GPS & display telematics binding', icon: 'Car' },
      { title: 'Emergency Dispatch SOP', desc: 'Incident reporting and route diversion', icon: 'Shield' },
      { title: 'Billing & Invoicing', desc: 'GST tax invoices & payment gateways', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How do I access support tickets across organizations?',
        a: 'Users can navigate to Help & Documentation and click "View Ticket History" to track real-time SLA resolutions.',
      },
      {
        q: 'How is system telemetry monitored?',
        a: 'All telematics heartbeats and screen impression events are transmitted via encrypted MQTT brokers to the central analytics cluster.',
      },
      {
        q: 'Where do I find video walkthroughs?',
        a: 'Click the "Video Tutorials" tile on your help page or open the academy modal to browse category-filtered interactive video guides.',
      },
    ],
  },

  'ROLE-DRIVER': {
    title: 'Driver Help & Documentation',
    summary: '24/7 Transit dispatch helpline, emergency road assistance, and driver operating manuals',
    historyPath: '/driver/help/history',
    contact: {
      theme: 'red',
      badge: 'Transit Emergency SOS',
      title: '1800-VMOVEXA / +91 98765 11111',
      description: 'Direct line to Central Transit Control Room & Breakdown Towing',
      ctaText: 'Call Control Room Now',
      actionAlert: 'Initiating priority dispatch call to central transit control room...',
    },
    guides: [
      { title: 'Driver Handbook', desc: 'SOP & Route regulations', icon: 'Document' },
      { title: 'Towing & Recovery', desc: 'Breakdown dispatch contacts', icon: 'Car' },
      { title: 'First Aid Protocols', desc: 'Passenger medical emergency SOP', icon: 'Shield' },
      { title: 'Depot Timetable', desc: 'Shift roster & rest schedules', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'What should I do in case of an on-road vehicle breakdown?',
        a: 'Park safely on the road shoulder, turn on hazard lights, ensure passenger safety, and immediately submit an incident report via the "Report Incident" button or call the Transit Control Room Hotline.',
      },
      {
        q: 'How do I request an urgent route detour or diversion?',
        a: 'If waterlogging or road works block your designated lane, follow the nearest marked transit diversion and note the waypoint in your trip log. Control room will automatically update live passenger screens.',
      },
      {
        q: 'When should I renew my Medical Fitness Certificate?',
        a: 'Annual medical fitness checks must be submitted at least 15 days before the expiry date to prevent temporary duty suspension on the fleet roster.',
      },
      {
        q: 'How do I report Fastag toll balance errors?',
        a: 'If a toll gate fails to read your RFID sticker, proceed using cash voucher if instructed by depot or file a complaint ticket under Tolls & Fastag in the support history tab.',
      },
    ],
  },

  'ROLE-FLEET-OPERATOR': {
    title: 'Fleet Operations Help & Documentation',
    summary: 'Master vehicle telemetry tracking, IoT GPS device installation, and operational fleet analytics.',
    historyPath: '/fleet-manager/help/history',
    contact: {
      theme: 'dark',
      badge: 'Support Desk Hours: 24/7',
      title: "We're Here to Help!",
      description: 'Get dedicated assistance for IoT GPS binding, vehicle telemetry issues, and dispatch inquiries.',
      ctaText: 'Open Priority Ticket',
      actionAlert: 'Connecting to Fleet Operations technical desk...',
    },
    guides: [
      { title: 'Fleet SOP Manual', desc: 'Depot dispatch & driver shifts', icon: 'Document' },
      { title: 'IoT GPS Pairing Guide', desc: 'CAN-bus & OBD-II telemetry binding', icon: 'Car' },
      { title: 'Emergency Protocols', desc: 'Accident and breakdown management', icon: 'Shield' },
      { title: 'Ad Screen Uptime SOP', desc: 'HDMI player & cache troubleshooting', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How do I bind a new IoT GPS tracker to a vehicle?',
        a: 'Go to Fleet Vehicles, select "Bind Device", scan or enter the 15-digit IMEI number, and trigger an ignition test to verify live telemetry handshake.',
      },
      {
        q: 'What triggers automated speed violation alerts?',
        a: 'Vehicles exceeding 60 km/h in urban zones or 80 km/h on transit corridors for more than 15 continuous seconds trigger instant telemetry alerts to the fleet supervisor.',
      },
      {
        q: 'How are ad playback impressions verified?',
        a: 'The RK3588 display matrix registers GPS-tagged proof-of-play timestamps every time a campaign slot completes, syncing records via MQTT to the analytics engine.',
      },
      {
        q: 'How do I reassign an active vehicle to a different depot?',
        a: 'Open Vehicle Profile > Actions > Transfer Depot, choose the target depot, and confirm handover with both depot dispatchers.',
      },
    ],
  },

  'ROLE-ADVERTISER': {
    title: 'Advertiser Help & Documentation',
    summary: 'Find answers to campaign creation, target route selection, creative specs, and live ROI telemetry.',
    historyPath: '/advertiser/help/history',
    contact: {
      theme: 'blue',
      badge: 'Advertiser Growth Desk',
      title: '+91 98765 43210 / support@vmovexa.com',
      description: 'Dedicated campaign strategist and creative verification desk. 4-hour SLA response.',
      ctaText: 'Request Strategy Call',
      actionAlert: 'Requesting advertiser growth specialist callback...',
    },
    guides: [
      { title: 'Campaign Setup Guide', desc: '6-step launch walkthrough', icon: 'Document' },
      { title: 'Creative Specs (16:9)', desc: '1080p MP4, JPG, HTML5 specs', icon: 'Shield' },
      { title: 'Smart QR Attribution', desc: 'Dynamic commuter lead tracking', icon: 'Car' },
      { title: 'Billing & GST Invoices', desc: 'Tax invoice downloads & wallet auto-reload', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How to create and launch a transit ad campaign?',
        a: 'Navigate to Campaigns and click "Create Campaign". Follow the step-by-step setup to input basic info, upload your 16:9 creative asset, select target transit fleets, configure schedule and budget, and submit for verification.',
      },
      {
        q: 'What are the recommended creative specifications?',
        a: 'We support MP4 (H.264), JPG, PNG, and HTML5 zip packages. Standard resolution is 1920×1080 (16:9), maximum duration is 30 seconds for video ads, and file size must be under 50 MB.',
      },
      {
        q: 'How does Smart QR code lead attribution work?',
        a: 'Every campaign generates a trackable QR identity. When passengers scan the QR code displayed on screen, the system records time, location, vehicle ID, and redirects them to your landing page.',
      },
      {
        q: 'How do billing, GST invoices, and deductions work?',
        a: 'Campaigns are charged on a daily or total budget model. GST (18%) is calculated on ad spend. Invoices with tax credits are automatically generated upon verification approval.',
      },
    ],
  },

  'ROLE-TENANT-ADMIN': {
    title: 'Tenant Admin Help & Documentation',
    summary: 'Organizational hierarchy, depot management, driver compliance audits, and system configuration runbooks.',
    historyPath: '/admin/help/history',
    contact: {
      theme: 'dark',
      badge: 'Enterprise Tenant Support',
      title: 'enterprise-help@vmovexa.com / +91 11 4567 8900',
      description: 'Priority operational support for transit organizations and fleet contractors.',
      ctaText: 'Contact Enterprise Desk',
      actionAlert: 'Opening enterprise tenant dispatch ticket...',
    },
    guides: [
      { title: 'Organization Onboarding', desc: 'Depot hierarchy & user roles setup', icon: 'Document' },
      { title: 'Driver KYC & Compliance', desc: 'Commercial license & biometric SOP', icon: 'Shield' },
      { title: 'Hardware RMA & Requisition', desc: 'Request central engineer depot servicing', icon: 'Car' },
      { title: 'Statutory Reports', desc: 'Monthly audit logs & SLA compliance', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How do I invite and assign operators to a specific depot?',
        a: 'Navigate to Organization > Users, click "Invite User", assign the ROLE-FLEET-OPERATOR role, and select the designated depot branch from the dropdown.',
      },
      {
        q: 'What happens when a driver license expires?',
        a: 'The system automatically marks the driver profile as pending verification and suspends route assignment 48 hours prior to expiry unless updated KYC documents are approved.',
      },
      {
        q: 'How do I request an on-site technician for hardware repairs?',
        a: 'Go to Maintenance > Service Tickets, click "Request Central Technician", select the vehicle ID and fault code, and a field engineer will be scheduled within 24 hours.',
      },
      {
        q: 'Can we customize public announcements displayed on screens?',
        a: 'Yes, authorized administrators can broadcast civic advisories and emergency messages through the Content Broadcast module.',
      },
    ],
  },

  'ROLE-CENTRAL-TECH': {
    title: 'Technician Field Help & Documentation',
    summary: 'Screen mounting schematics, CAN-bus pinouts, firmware flashing, and depot diagnostic toolkits.',
    historyPath: '/technician/help/history',
    contact: {
      theme: 'slate',
      badge: 'Engineering Escalation NOC',
      title: 'noc-tech@vmovexa.com / Extension 404',
      description: 'Live hardware engineering dispatch for RK3588, GPS antenna, and CAN-bus troubleshooting.',
      ctaText: 'Call Engineering NOC',
      actionAlert: 'Connecting to Engineering Network Operations Center...',
    },
    guides: [
      { title: 'Display Mounting Guide', desc: 'Commercial 15.6" screen installation', icon: 'Document' },
      { title: 'CAN-bus J1939 Pinouts', desc: 'OBD-II baud rates & telemetry binding', icon: 'Car' },
      { title: 'Firmware Recovery Runbook', desc: 'RK3588 recovery & cache wipe SOP', icon: 'Shield' },
      { title: 'Depot Spares RMA', desc: 'Warranty replacement & parts inventory', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How do I perform a hard reset on the RK3588 display board?',
        a: 'Hold the recovery button located adjacent to the micro-USB OTG port for 8 seconds while powering on. The blue LED will pulse rapidly indicating recovery mode.',
      },
      {
        q: 'What is the standard baud rate for CAN-bus J1939 telematics?',
        a: 'Standard transit telemetry interfaces operate at 250 kbps (J1939-11) or 500 kbps (J1939-14) depending on the vehicle chassis generation.',
      },
      {
        q: 'How to diagnose screen flickering or black screen issues?',
        a: 'Check 12V/24V power supply ripple using a multimeter. Ensure HDMI ribbon cable is seated firmly and ad cache storage is not full.',
      },
      {
        q: 'Where do I submit completed repair work orders?',
        a: 'Open your Active Tasks, select the assigned vehicle work order, attach photos of the repair and the signed driver handover sheet, and click "Submit & Close".',
      },
    ],
  },

  'ROLE-GOVT-AGENCY': {
    title: 'Government Authority Help & Documentation',
    summary: 'Civic transit oversight, emergency disaster broadcast SOPs, commuter safety, and statutory audit compliance.',
    historyPath: '/government/help/history',
    contact: {
      theme: 'dark',
      badge: 'Civic Transport Oversight',
      title: 'civic-desk@vmovexa.com / 1800-TRANSIT-GOV',
      description: 'State transport ministry liaison and emergency broadcast protocol desk.',
      ctaText: 'Emergency Dispatch Override',
      actionAlert: 'Opening priority emergency broadcast channel...',
    },
    guides: [
      { title: 'Civic Broadcast SOP', desc: 'Public announcements & route advisory', icon: 'Document' },
      { title: 'Disaster SOS Protocol', desc: 'Zone-wide emergency screen override', icon: 'Shield' },
      { title: 'Commuter Density Heatmaps', desc: 'Passenger telemetry & route analysis', icon: 'Car' },
      { title: 'Statutory Audit Logs', desc: 'Driver duty hours & safety compliance', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How do I trigger an emergency public notice across all city transit displays?',
        a: 'Go to Broadcast Announcements, select "Emergency Alert", define the geographic zones or routes, set the alert duration, and confirm with your dual-factor authentication PIN.',
      },
      {
        q: 'How frequently is passenger density telemetry updated?',
        a: 'Commuter load telemetry is aggregated from GPS, smart ticketing, and stop camera sensors every 60 seconds across all active municipal routes.',
      },
      {
        q: 'How to export statutory compliance logs for state audits?',
        a: 'Navigate to Compliance Reports, select the audit date range, and export tamper-proof SHA-256 signed CSV or PDF audit bundles.',
      },
      {
        q: 'What are the safety standards required for commercial ad displays?',
        a: 'All transit displays adhere to automotive vibration (ISO 16750) and flame-retardant safety standards with mandatory auto-dimming during night transit.',
      },
    ],
  },

  'ROLE-FINANCE-OFFICER': {
    title: 'Finance & Accounts Help & Documentation',
    summary: 'Automated billing engine, GST GSTR-1 filings, gateway reconciliation, and advertiser wallet ledgers.',
    historyPath: '/finance/help/history',
    contact: {
      theme: 'slate',
      badge: 'Corporate Financial Desk',
      title: 'finance-audit@vmovexa.com / +91 11 2345 6789',
      description: 'Banking reconciliation, payment gateway settlements, and statutory tax compliance.',
      ctaText: 'Contact Accounts Lead',
      actionAlert: 'Routing to corporate finance desk...',
    },
    guides: [
      { title: 'GSTR-1 Filing SOP', desc: 'Tax invoice export & HSN/SAC breakdown', icon: 'Document' },
      { title: 'Gateway Reconciliation', desc: 'Razorpay / Cashfree settlement matching', icon: 'Clock' },
      { title: 'Wallet Escrow Rules', desc: 'Advertiser deposit handling & auto-reload', icon: 'Shield' },
      { title: 'Credit Notes & Disputes', desc: 'Screen downtime SLA rebates', icon: 'Car' },
    ],
    faqs: [
      {
        q: 'When are daily advertiser billing deductions processed?',
        a: 'Daily ad campaign spend is settled from advertiser wallet balances at 23:59:59 IST based on verified impression telemetry logs.',
      },
      {
        q: 'How are HSN/SAC codes applied for transit advertising?',
        a: 'Transit digital advertising is classified under SAC 998363 (Sale of advertising space or time on transit media) at 18% GST.',
      },
      {
        q: 'How to resolve bank reconciliation mismatches?',
        a: 'Upload the monthly bank statement CSV in Financial Reconciliation. The engine automatically matches UTR numbers against payment gateway deposits.',
      },
      {
        q: 'What is the procedure for issuing screen outage credit notes?',
        a: 'When an advertiser files an SLA dispute verified by NOC telemetry, finance officers can issue a credit note credited directly back to the advertiser wallet.',
      },
    ],
  },

  'ROLE-SUPER-ADMIN': {
    title: 'Super Admin Help & Documentation',
    summary: 'MIOS cloud clustering, MQTT telemetry broker tuning, tenant multi-tenancy isolation, and sovereign firmware runbooks.',
    historyPath: '/superadmin/help/history',
    contact: {
      theme: 'dark',
      badge: 'Platform Engineering & NOC',
      title: 'root-noc@vmovexa.com / Direct Bridge #1',
      description: 'Central Sovereign Platform NOC — 99.99% Core SLA Architecture.',
      ctaText: '',
      actionAlert: '',
    },
    guides: [
      { title: 'Core Architecture', desc: 'Node.js, MySQL & Redis clustering topology', icon: 'Document' },
      { title: 'MQTT Broker Scaling', desc: 'EMQX high-concurrency telematics tuning', icon: 'Shield' },
      { title: 'Multi-Tenant Provisioning', desc: 'Tenant isolation & quota allocation', icon: 'Car' },
      { title: 'OTA Firmware Push', desc: 'Staged rollout & emergency blackout switches', icon: 'Clock' },
    ],
    faqs: [
      {
        q: 'How to scale MQTT broker clusters during peak traffic?',
        a: 'EMQX brokers are deployed in an autoscaling container group. Increase replica pods and adjust connection keep-alive timeouts in the Telematics Configuration.',
      },
      {
        q: 'How is tenant database isolation maintained?',
        a: 'Each tenant organization utilizes row-level security tokens and isolated storage buckets, with strict API gateway tenant context propagation.',
      },
      {
        q: 'How to trigger a global emergency ad blackout?',
        a: 'Super Admins can execute the Kill-Switch command from the Security Operations Center, sending a priority MQTT broadcast to instantly clear all screen framebuffers.',
      },
      {
        q: 'Where are cold telemetry audit logs archived?',
        a: 'Telemetry logs older than 90 days are compressed into Parquet format and stored in immutable cloud cold storage with 7-year retention compliance.',
      },
    ],
  },
};
