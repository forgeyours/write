// ============================================================
// FILE: src/data/templates.ts
// PURPOSE: Modular document templates for Academic, Creative, and Business use
// ============================================================

export interface DocumentTemplate {
  name: string;
  description: string;
  content: string;
  fontFamily: string;
  lineSpacing: string;
  isCustom?: boolean;
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    name: 'Academic Essay',
    description: 'Double-spaced layout with classical headers, citation guidelines, and elegant Georgia typography.',
    fontFamily: 'Georgia, serif',
    lineSpacing: '2.0',
    content: `
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 14pt; font-weight: bold; margin: 0;">THE ARCHITECTURE OF ANCIENT LIBRARY WORKSPACES</p>
        <p style="font-size: 11pt; font-style: italic; margin: 5px 0 0 0;">An Analysis of Spatial Layout and Intellectual Concentration</p>
        <p style="font-size: 11pt; margin: 15px 0 0 0;">Prepared by: Alex Mercer</p>
        <p style="font-size: 11pt; margin: 2px 0 0 0;">Department of Classical Studies, University of Athens</p>
        <p style="font-size: 11pt; margin: 2px 0 0 0;">June 12, 2026</p>
      </div>

      <p style="text-indent: 40px; margin-bottom: 20px;">
        This paper explores how the physical spatial design of ancient library repositories influenced cognitive endurance and scholars' ability to synthesize complex primary texts. Libraries such as the Celsus in Ephesus were engineered not merely as warehouses for papyrus scrolls, but as integrated climate-moderated chambers where light angles, draft reductions, and quiet acoustics were prioritized to sustain prolonged reading sessions.
      </p>

      <p style="text-indent: 40px; margin-bottom: 20px;">
        By investigating original physical foundations and ancient correspondence, we hypothesize that the structural orientation of reading alcoves towards early morning light minimized optical fatigue, permitting continuous focus. Furthermore, the thick double-shell walls insulated early researchers against temperature spikes and outdoor marketplace clamor, forming a sanctuary for deep work.
      </p>

      <div style="border-top: 1px dashed #CBD2DA; border-bottom: 1px dashed #CBD2DA; padding: 10px; margin: 25px 0; font-size: 10pt; color: #5B6474;">
        <strong>Author's Note:</strong> All primary citations in this essay adhere to Chicago Manual of Style guidelines. Utilize the text highlighter to mark references for cross-referencing.
      </div>

      <h2 style="font-size: 14pt; font-weight: bold; margin-top: 25px; margin-bottom: 15px;">I. Light Orientation and Optical Fatigue</h2>
      <p style="text-indent: 40px; margin-bottom: 20px;">
        Contemporary ergonomics matches ancient alignment strategies. Morning light provides an optimal blue-wavelength distribution that stimulates alertness. Ancient architects aligned read-chambers at 80 degrees east to harvest the first six hours of daytime illumination without suffering peak solar heat from midday rays.
      </p>
    `
  },
  {
    name: 'Meeting Agenda & Notes',
    description: 'Compact tabular structure with milestone tracker, action item checkbox table, and focus blocks.',
    fontFamily: 'Inter, sans-serif',
    lineSpacing: '1.5',
    content: `
      <h1 style="font-size: 24pt; font-weight: bold; color: #E85D00; margin-bottom: 5px; border-bottom: 2px solid #E85D00; padding-bottom: 10px;">Weekly Engineering Sync Agenda</h1>
      <p style="font-size: 10pt; color: #5B6474; margin-bottom: 20px;"><strong>Date:</strong> June 12, 2026 | <strong>Facilitator:</strong> Product Operations Team | <strong>Status:</strong> Live Agenda</p>

      <blockquote style="border-left: 4px solid #E85D00; margin: 15px 0; padding: 8px 16px; color: #5B6474; font-style: italic; background: #FFF3EB;">
        "Focus on delivering core value first. A complete, clean layout is infinitely superior to fragmented unverified modules."
      </blockquote>

      <h2 style="font-size: 16pt; font-weight: bold; margin-top: 25px; margin-bottom: 12px; color: #1A1D23;">1. Project Status Summary</h2>
      
      <table style="border-collapse: collapse; width: 100%; margin: 15px 0; font-size: 11pt;">
        <thead>
          <tr style="background: #F2F4F7; border-bottom: 2px solid #D0D5DD;">
            <th style="border: 1px solid #D0D5DD; padding: 10px; text-align: left; font-weight: 600;">Work Stream</th>
            <th style="border: 1px solid #D0D5DD; padding: 10px; text-align: left; font-weight: 600;">Current Status</th>
            <th style="border: 1px solid #D0D5DD; padding: 10px; text-align: left; font-weight: 600;">Owner</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #D0D5DD; padding: 10px;"><strong>Image Resizers</strong></td>
            <td style="border: 1px solid #D0D5DD; padding: 10px; color: #027A48; font-weight: 600;">In Progress</td>
            <td style="border: 1px solid #D0D5DD; padding: 10px;">Engineering</td>
          </tr>
          <tr>
            <td style="border: 1px solid #D0D5DD; padding: 10px;"><strong>Canvas Scaling View</strong></td>
            <td style="border: 1px solid #D0D5DD; padding: 10px; color: #027A48; font-weight: 600;">Done (95%)</td>
            <td style="border: 1px solid #D0D5DD; padding: 10px;">Frontend Lead</td>
          </tr>
          <tr>
            <td style="border: 1px solid #D0D5DD; padding: 10px;"><strong>Templates Library</strong></td>
            <td style="border: 1px solid #D0D5DD; padding: 10px; color: #B54708; font-weight: 600;">Validation</td>
            <td style="border: 1px solid #D0D5DD; padding: 10px;">Product Design</td>
          </tr>
        </tbody>
      </table>

      <h2 style="font-size: 16pt; font-weight: bold; margin-top: 25px; margin-bottom: 12px; color: #1A1D23;">2. Specific Action Items</h2>
      <ul>
        <li><strong>Verify zoom scale matches PDF prints</strong> so that small screens can view intact letter aspect ratios correctly.</li>
        <li><strong>Incorporate Color Selectors</strong> directly within document execution flow to avoid selection loss.</li>
        <li><strong>Insert table templates</strong> to accelerate custom tabular charts.</li>
      </ul>
    `
  },
  {
    name: 'Modern Resume / CV',
    description: 'A clean, dual-column structure for contact, professional experience, education, and skill blocks.',
    fontFamily: 'Inter, sans-serif',
    lineSpacing: '1.2',
    content: `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #374151; padding-bottom: 15px; margin-bottom: 25px;">
        <div>
          <h1 style="font-size: 26pt; font-weight: 800; color: #1A1D23; margin: 0; letter-spacing: -0.02em;">Taylor Vance</h1>
          <p style="font-size: 12pt; color: #E85D00; font-weight: 600; margin: 4px 0 0 0;">Senior Interactive Systems Engineer</p>
        </div>
        <div style="text-align: right; font-size: 10pt; color: #4B5563; line-height: 1.4;">
          <p style="margin: 0;">taylor@vance.engineering</p>
          <p style="margin: 0;">+1 (555) 019-2834</p>
          <p style="margin: 0;">San Francisco, CA</p>
        </div>
      </div>

      <h2 style="font-size: 13pt; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-top: 20px;">Professional Summary</h2>
      <p style="font-size: 10.5pt; color: #1A1D23; margin-bottom: 20px;">
        Innovative Systems Architect with over 8 years of experience designing robust frontend frameworks, responsive client-side scaling editors, and AI operations toolsets. Passionate about developer workflows, pixel-perfect UX layouts, and scalable document sync ecosystems.
      </p>

      <h2 style="font-size: 13pt; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-top: 20px;">Work Experience</h2>
      
      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt; color: #1A1D23;">
          <span>Principal Frontend Architect — TechPulse Inc</span>
          <span style="font-weight: 500; color: #6B7280;">2024 – Present</span>
        </div>
        <p style="font-size: 10pt; font-style: italic; color: #4B5563; margin: 2px 0 6px 0;">Lead designer of scaled digital canvases and word-processing PWA architectures</p>
        <ul style="margin: 0; padding-left: 20px; font-size: 10pt; color: #374151;">
          <li>Pioneered CSS canvas zoom mechanisms improving accessibility for mobile tablet devices by 140%.</li>
          <li>Engineered background offline syncer using IndexedDB saving millions of words from connection loss.</li>
        </ul>
      </div>

      <div style="margin-bottom: 15px;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt; color: #1A1D23;">
          <span>Lead Systems Engineer — ByteForge Labs</span>
          <span style="font-weight: 500; color: #6B7280;">2021 – 2024</span>
        </div>
        <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 10pt; color: #374151;">
          <li>Designed elegant print layout renderers matching native margins perfectly on export.</li>
          <li>Optimized selection state managers to stabilize complex table cell operations.</li>
        </ul>
      </div>

      <h2 style="font-size: 13pt; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-top: 20px;">Core Skills</h2>
      <table style="width: 100%; border: none; font-size: 10pt; margin-top: 8px;">
        <tr>
          <td style="width: 30%; vertical-align: top; padding: 4px 0;"><strong>Languages:</strong></td>
          <td style="color: #374151; padding: 4px 0;">TypeScript, JavaScript (ES6+), HTML5/CSS3, Python</td>
        </tr>
        <tr>
          <td style="vertical-align: top; padding: 4px 0;"><strong>Frameworks & Tools:</strong></td>
          <td style="color: #374151; padding: 4px 0;">React, Vite, Tailwind CSS, Lucide icons, D3, Recharts, Git</td>
        </tr>
        <tr>
          <td style="vertical-align: top; padding: 4px 0;"><strong>Product Design:</strong></td>
          <td style="color: #374151; padding: 4px 0;">PWA Mechanics, Scaling Viewports, Interactive Canvas Layouts</td>
        </tr>
      </table>
    `
  },
  {
    name: 'Form Letters',
    description: 'Clean formal layout matching industrial communication guidelines.',
    fontFamily: 'Georgia, serif',
    lineSpacing: '1.5',
    content: `
      <p style="margin: 0; font-weight: bold; font-size: 12pt;">ForgeYours Technologies Corp</p>
      <p style="margin: 0; font-size: 10pt; color: #4B5563;">100 Silicon Way, Tech Hub</p>
      <p style="margin: 0; font-size: 10pt; color: #4B5563;">contact@forgeyours.space</p>

      <p style="margin-top: 30px; margin-bottom: 30px;">June 12, 2026</p>

      <p style="margin: 0;"><strong>Attention:</strong> Operations Director</p>
      <p style="margin: 0;">Initech Solutions Group</p>
      <p style="margin: 0; color: #4B5563;">456 Enterprise Parkway</p>

      <p style="margin-top: 30px; margin-bottom: 15px;"><strong>Subject: Proposal for Fluid Canvas Scaling Upgrades</strong></p>

      <p style="margin-bottom: 15px;">Dear Director,</p>

      <p style="margin-bottom: 15px;">
        I am writing to submit our official technical strategy for the implementation of unified document Scaling Viewports, enabling pristine multi-device layouts. Under current web parameters, viewing full letter page aspects on mobile devices presents a major structural bottleneck.
      </p>

      <p style="margin-bottom: 15px;">
        Our proposal introduces physical CSS scale transforms paired with container dynamic height mapping. This maintains complete alignment integrity while making document text responsive and crisp without font-size distortions.
      </p>

      <p style="margin-bottom: 15px;">
        We would welcome the opportunity to discuss this integration in more detail in the upcoming week. Attached is the project status table containing milestones and engineering allocations.
      </p>

      <p style="margin-top: 40px; margin-bottom: 5px;">Sincerely,</p>
      <p style="margin: 0; font-weight: bold;">Pat Sterling</p>
      <p style="margin: 0; font-size: 10pt; color: #4B5563;">Operations Manager, ForgeYours Write</p>
    `
  }
];
