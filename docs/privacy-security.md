# Privacy & Security 🔒

## Overview

This document outlines the privacy and security considerations for the Marksheet Expo App, particularly for commercial and educational use.

## Data Storage & Privacy

### Local Storage Only

All exam data and student information is stored **locally on the user's device**:

- **Exam Configurations**: Stored in device's AsyncStorage
- **Grading History**: Stored in device's AsyncStorage
- **Student Data**: Never transmitted to external servers except OpenAI
- **No Cloud Sync**: No data is automatically synchronized to cloud services

### What Data is Stored Locally

The app stores the following data on your device:

1. **Exam Configurations**:
   - Exam titles
   - Question definitions (labels, points, options)
   - Correct answer keys

2. **Grading Results**:
   - Student names (if entered)
   - Filled answer selections
   - Calculated scores
   - Timestamps

3. **Settings**:
   - OpenAI API Key (encrypted in SecureStore)
   - Selected AI Model
   - Debug mode preference

### Data Sharing with Third Parties

**OpenAI API**: The only external service that receives data is OpenAI's API for:

- **Exam Generation**: Uploaded PDF/image files for parsing exam layouts
- **Answer Grading**: Uploaded answer sheet images for optical recognition

**What OpenAI Receives**:
- Images/PDFs you explicitly upload for processing
- Exam configuration data (for grading context)
- **NOT** any persistent student identifiable information

**OpenAI's Data Policy**: 
- As of 2024, OpenAI's API does not use customer data submitted via API to train models
- Data may be retained for 30 days for abuse monitoring
- See [OpenAI's Data Usage Policy](https://openai.com/policies/usage-policies) for current terms

## Security Features

### API Key Protection

- **Encrypted Storage**: API keys are stored using `expo-secure-store`, which provides encrypted storage
- **Never Logged**: API keys are never written to console logs (even in debug mode)
- **Not in Code**: API keys should never be committed to version control

### Best Practices for Users

1. **API Key Management**:
   - Use unique API keys per deployment/organization
   - Rotate API keys regularly (every 90 days recommended)
   - Set up API key usage limits in OpenAI dashboard
   - Monitor API usage for anomalies

2. **Student Data Protection**:
   - Minimize collection of personally identifiable information
   - Use student IDs instead of names when possible
   - Regularly delete old grading records
   - Ensure physical device security (lock screen, encryption)

3. **Data Export**:
   - CSV exports may contain student data - handle securely
   - Use secure sharing methods (encrypted email, secure file sharing)
   - Delete exports after use

## Compliance Considerations

### Educational Data Privacy Laws

When using this app in educational settings, ensure compliance with relevant regulations:

#### FERPA (United States)
- **Family Educational Rights and Privacy Act**
- Protects student education records
- Requires consent for disclosure
- **Recommendation**: Use student IDs, not names; obtain necessary consents

#### GDPR (European Union)
- **General Data Protection Regulation**
- Applies to EU residents' personal data
- Requires lawful basis for processing
- **Recommendation**: Document data processing purposes; implement data minimization

#### COPPA (United States)
- **Children's Online Privacy Protection Act**
- Applies to children under 13
- Requires parental consent for data collection
- **Recommendation**: Obtain proper consents if used with young students

### Third-Party Service Compliance

**OpenAI API**:
- Review OpenAI's [Terms of Service](https://openai.com/policies/terms-of-use)
- Check OpenAI's GDPR compliance if serving EU users
- Understand data retention and deletion policies

## Security Recommendations

### For Individual Users

1. **Device Security**:
   - Enable device lock screen
   - Use full-disk encryption (enabled by default on modern devices)
   - Keep device OS updated

2. **Network Security**:
   - Use secure WiFi networks
   - Avoid public WiFi for sensitive grading
   - Consider VPN for additional security

3. **Access Control**:
   - Don't share your device with untrusted users
   - Log out of OpenAI account when not in use
   - Clear app data when disposing of device

### For Institutional/Commercial Use

1. **Access Control**:
   - Implement device management (MDM) solutions
   - Use institutional OpenAI accounts with centralized billing
   - Implement role-based access if deploying custom versions

2. **Audit & Monitoring**:
   - Monitor API usage through OpenAI dashboard
   - Implement logging for grading activities (if required)
   - Regular security audits of deployed systems

3. **Data Lifecycle**:
   - Define retention policies for exam data
   - Implement secure deletion procedures
   - Document data handling procedures

4. **Custom Deployment**:
   - Consider self-hosting if data sovereignty is required
   - Implement additional encryption for stored data
   - Add authentication/authorization layers

## Data Breach Response

In case of device loss or theft:

1. **Immediate Actions**:
   - Remote wipe device if MDM is configured
   - Revoke OpenAI API key immediately
   - Notify affected students/parents if required by law

2. **Prevention**:
   - Enable Find My Device features
   - Regular backups (excluding sensitive data)
   - Minimize data stored on device

## Known Limitations

1. **No Built-in Authentication**: App doesn't require login - anyone with device access can use it
2. **No Audit Trail**: No built-in logging of who accessed what data
3. **No Data Encryption at Rest**: Local data stored in AsyncStorage is not encrypted (except API key)
4. **No Network Encryption Control**: Relies on OpenAI's HTTPS for data in transit

## Recommendations for Enhanced Security

If you need stronger security for commercial/institutional use:

1. **Fork and Customize**:
   - Add user authentication (e.g., OAuth, SAML)
   - Implement database encryption
   - Add comprehensive audit logging

2. **Backend Integration**:
   - Build a backend API for centralized data storage
   - Implement server-side grading for sensitive exams
   - Add role-based access control

3. **Compliance Tools**:
   - Add consent management features
   - Implement data export/deletion tools (GDPR "right to be forgotten")
   - Generate compliance reports

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email the maintainers privately (see CONTRIBUTING.md)
3. Provide detailed description and reproduction steps
4. Allow reasonable time for fix before public disclosure

## Resources

- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy)
- [OpenAI API Data Usage Policy](https://openai.com/policies/usage-policies)
- [FERPA Overview](https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html)
- [GDPR Official Site](https://gdpr.eu/)
- [Expo SecureStore Documentation](https://docs.expo.dev/versions/latest/sdk/securestore/)

## Updates

This document will be updated as the application evolves and as regulations change. Last updated: 2026-02-13.

---

**Disclaimer**: This document provides general guidance and is not legal advice. Consult with legal counsel to ensure compliance with applicable laws and regulations in your jurisdiction.
