# Commercial Deployment Guide 💼

This guide helps organizations deploy the Marksheet Expo App for commercial or institutional use.

## Pre-Deployment Checklist

### Legal & Compliance
- [ ] Review MIT License terms and understand your rights
- [ ] Assess applicable data protection regulations (FERPA, GDPR, etc.)
- [ ] Prepare privacy policy for end users
- [ ] Obtain necessary consents for data processing
- [ ] Review OpenAI's Terms of Service and Data Processing Agreement

### Technical Requirements
- [ ] OpenAI API account with appropriate billing limits
- [ ] Sufficient API budget for expected usage
- [ ] Device management system (for institutional deployment)
- [ ] Network infrastructure (if using centralized API key)

### Organizational Readiness
- [ ] Define use cases and workflows
- [ ] Identify user roles and permissions needs
- [ ] Plan data retention and deletion policies
- [ ] Train staff on app usage and data handling

## Deployment Options

### Option 1: Standard Deployment (Easiest)

**Use Case**: Small organizations, individual teachers, tutoring centers

**Approach**:
1. Install the app on teacher/staff devices from source
2. Each user configures their own OpenAI API key
3. Data stays on individual devices
4. No backend infrastructure needed

**Pros**:
- Simple setup
- No infrastructure costs
- Full data control on device

**Cons**:
- No centralized management
- API costs per user
- No data aggregation across devices

**Steps**:
1. Clone repository to each device
2. Run `bun install` and `bun start`
3. Users configure API keys in Settings
4. Provide user training

### Option 2: Centralized API Key (Recommended)

**Use Case**: Schools, institutions with multiple users

**Approach**:
1. Create institutional OpenAI API account
2. Fork repository and configure environment variable
3. Build custom app with pre-configured API key
4. Distribute to users via EAS Build or similar

**Pros**:
- Centralized billing and monitoring
- Usage analytics
- Cost control (set API limits)
- Simpler for end users

**Cons**:
- Requires app build/distribution setup
- Need to protect API key in build
- All usage on one API key

**Steps**:
1. Fork this repository
2. Set up Expo EAS (Expo Application Services):
   ```bash
   npm install -g eas-cli
   eas login
   eas build:configure
   ```
3. Add environment variable to `eas.json`:
   ```json
   {
     "build": {
       "production": {
         "env": {
           "EXPO_PUBLIC_OPENAI_API_KEY": "sk-your-key-here"
         }
       }
     }
   }
   ```
4. Build for your platforms:
   ```bash
   eas build --platform android
   eas build --platform ios
   ```
5. Distribute via app stores or internal deployment

### Option 3: Custom Backend Integration (Advanced)

**Use Case**: Large institutions, commercial SaaS deployment

**Approach**:
1. Build backend API for centralized data storage
2. Implement authentication and user management
3. Proxy OpenAI API calls through backend
4. Add analytics, reporting, and admin features

**Pros**:
- Full control over data
- Multi-tenancy support
- Advanced features (SSO, audit logs, etc.)
- Scalable for thousands of users

**Cons**:
- Significant development effort
- Infrastructure costs (servers, databases)
- Ongoing maintenance

**Architecture**:
```
Mobile App ←→ Backend API ←→ Database
                    ↓
                OpenAI API
```

**Recommended Stack**:
- Backend: Node.js (Express/NestJS), Python (FastAPI), or similar
- Database: PostgreSQL, MongoDB
- Auth: OAuth 2.0, SAML for enterprise SSO
- Hosting: AWS, Google Cloud, Azure, or similar

## Cost Management

### Estimating API Costs

**Per Exam Generation**: $0.01-0.05 (depending on model and complexity)
**Per Sheet Grading**: $0.01-0.05

**Example: School with 500 students**
- 10 exams per year
- Exam generation: 10 × $0.05 = $0.50
- Grading: 500 × 10 × $0.03 = $150
- **Annual Total**: ~$150-200

### Cost Optimization

1. **Use GPT-4o-mini for Most Tasks**:
   - 5-10x cheaper than GPT-4o
   - Sufficient accuracy for most exams
   - Use GPT-4o only for complex layouts

2. **Set Usage Limits**:
   - OpenAI Dashboard → Usage Limits
   - Set monthly caps to prevent overages
   - Set up billing alerts

3. **Batch Operations**:
   - Grade multiple students at once when possible
   - Reuse exam configurations
   - Cache common operations

4. **Monitor Usage**:
   - Enable debug mode to track API calls
   - Review OpenAI usage reports monthly
   - Identify inefficient patterns

## Security Hardening

### For Standard Deployment

1. **Device Security**:
   ```
   - Enable full-disk encryption
   - Require strong device passwords
   - Enable remote wipe capabilities
   - Keep OS and app updated
   ```

2. **API Key Security**:
   ```
   - Use separate API key per deployment tier (dev/prod)
   - Rotate keys every 90 days
   - Never commit keys to version control
   - Monitor for unusual usage patterns
   ```

### For Custom Builds

1. **Build Security**:
   - Use Expo's SecureStore for API keys
   - Enable code obfuscation in production builds
   - Implement certificate pinning for API calls
   - Use ProGuard/R8 for Android builds

2. **Backend Security** (if applicable):
   - Implement rate limiting
   - Use WAF (Web Application Firewall)
   - Regular security audits
   - Implement comprehensive logging

## Data Management

### Data Retention Policy

Define policies for:
- **Active Exams**: How long to keep current semester exams
- **Historical Data**: How long to retain past results
- **Student Data**: When to purge student information
- **Backups**: Backup frequency and retention

**Recommended**:
- Active exams: Keep indefinitely or until explicitly deleted
- Grading history: 1-2 years (or per institutional policy)
- Student data: Minimum necessary, delete after grade reporting
- Backups: Regular automated backups, 90-day retention

### Data Export & Portability

Users can export data in CSV format:
1. Navigate to graded exam
2. Tap Export → CSV
3. Data includes: student info, scores, question-level results

For bulk export:
- Implement custom backup solution in forked version
- Use AsyncStorage access to export all data
- Schedule automated exports if needed

### Data Deletion

**For individual users**:
- Delete exams individually in app
- Clear all app data in device settings

**For institutions**:
- Implement remote data wipe via MDM
- Create admin tool for bulk deletion
- Document deletion in compliance records

## User Training

### For Teachers/Graders

**Training Topics**:
1. Creating exams (manual and AI-generated)
2. Setting correct answers
3. Exporting PDFs for printing
4. Scanning and grading answer sheets
5. Manual correction of AI errors
6. Exporting results

**Training Materials**:
- User guide: `docs/usage.md`
- Quick reference: `docs/quick-reference.md`
- Video tutorials: (create internal or use README demos)

### For Administrators

**Training Topics**:
1. API key management
2. Usage monitoring
3. Cost tracking
4. Data privacy compliance
5. Troubleshooting common issues
6. Security best practices

## Compliance Documentation

### Required Documentation

For educational institutions, maintain:

1. **Data Processing Agreement**:
   - Document what data is collected
   - How it's used and stored
   - Third-party processors (OpenAI)

2. **Privacy Policy**:
   - Inform users about data practices
   - Explain OpenAI data sharing
   - Provide contact for questions

3. **User Consent Forms**:
   - Obtain consent for AI processing
   - Parent consent for minors if required
   - Document consent records

4. **Incident Response Plan**:
   - Procedures for data breaches
   - Notification requirements
   - Mitigation steps

### Sample Privacy Notice

```
Privacy Notice for Marksheet App

Data Collected:
- Exam configurations (questions, answers, points)
- Student grading results (if entered)
- Scanned answer sheet images (temporary, for processing)

Data Usage:
- Images and exams are sent to OpenAI for AI processing
- Results are stored locally on your device
- No data is shared with other third parties

Data Retention:
- Exam data: Until you delete it
- OpenAI may retain data for 30 days per their policy

Your Rights:
- Access your data anytime in the app
- Delete your data at any time
- Export your data in CSV format

Contact: [Your institutional contact]
```

## Support & Maintenance

### Support Resources

**For Users**:
- Troubleshooting guide: `docs/troubleshooting.md`
- Setup guide: `docs/setup.md`
- Internal help desk (if available)

**For Developers**:
- Contributing guide: `CONTRIBUTING.md`
- Architecture docs: `docs/architecture.md`
- GitHub issues for bug reports

### Maintenance Plan

**Regular Tasks**:
- [ ] Monthly: Review API usage and costs
- [ ] Quarterly: Rotate API keys
- [ ] Quarterly: Update app dependencies
- [ ] Semi-annually: Security audit
- [ ] Annually: Compliance review

**Updates**:
- Monitor GitHub releases for updates
- Test updates in staging environment
- Deploy updates during low-usage periods

## Scaling Considerations

### Small Scale (1-50 users)
- Standard deployment sufficient
- Individual API keys or shared key
- Minimal infrastructure needed

### Medium Scale (50-500 users)
- Centralized API key recommended
- Consider custom build distribution
- Implement usage monitoring
- Basic analytics

### Large Scale (500+ users)
- Custom backend strongly recommended
- Multi-tenancy support
- Advanced analytics and reporting
- Dedicated support team
- SLA for uptime and performance

## Licensing & Attribution

This app is MIT licensed. When deploying commercially:

**Requirements**:
- Include MIT License text in your distribution
- Maintain copyright notice
- No additional restrictions on users

**Optional but Appreciated**:
- Contribute improvements back to open source
- Link to original repository
- Credit original authors

## Getting Help

**Technical Issues**:
- GitHub Issues: https://github.com/linkalls/marksheet-test/issues
- Email maintainers (see CONTRIBUTING.md)

**Commercial Deployment**:
- Review docs thoroughly
- Consider hiring consultant for custom deployments
- Community support via GitHub Discussions

**Legal/Compliance**:
- Consult with legal counsel
- Review OpenAI's enterprise offerings
- Consider data processing agreements

## Success Metrics

Track these metrics to measure deployment success:

**Usage Metrics**:
- Number of exams created per week
- Number of students graded per week
- API call volume and costs

**Quality Metrics**:
- AI grading accuracy (compare to manual grading)
- Time saved vs manual grading
- User satisfaction scores

**Compliance Metrics**:
- Data breach incidents (target: 0)
- Compliance audit results
- User training completion rates

---

**Questions?** See [CONTRIBUTING.md](../CONTRIBUTING.md) for contact information.
