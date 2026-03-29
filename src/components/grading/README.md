# Care Collaborative Evidence-Based Grading System

This directory contains components for the evidence-based grading system in Care Collaborative. The grading system provides detailed feedback on healthcare communication skills based on real conversation analysis using LLM technology.

## Components

### GradingButton
A button component that triggers the grading process. It can be used in various parts of the application to initiate grading.

### GradingHistory
Displays a history of past assessments with search functionality and the ability to view or delete individual assessments.

### GradingResults
Displays the detailed results of an assessment, including overall score, competency breakdown, and evidence from the conversation.

### GradingResultsWrapper
A wrapper component that handles displaying either the grading results or a placeholder when there's not enough conversation data.

### GradingNavButton
A navigation button that links to the grading dashboard page.

## How It Works

1. **Data Collection**: 
   - The system captures the actual conversation between the healthcare provider and the patient
   - It extracts specific quotes and exchanges as evidence for assessment

2. **LLM-Based Analysis**:
   - The conversation transcript is sent to an LLM API endpoint (/api/llm/grade)
   - The LLM analyzes the conversation using standard healthcare communication frameworks
   - The analysis is based on real evidence from the conversation, not predetermined metrics

3. **Data Storage**: 
   - All assessment data is stored in the browser's localStorage using the `useGradingHistory` hook
   - This ensures privacy while maintaining a history of assessments

4. **Grading Process**: 
   - The grading process is triggered either manually via the GradingButton or automatically when ending a conversation
   - The system checks if there's enough conversation data (minimum exchanges) before attempting to grade
   - If there's enough data, it sends the conversation to the LLM for analysis
   - The assessment is saved to localStorage and displayed to the user

5. **Assessment Structure**:
   - Overall score and comprehensive feedback
   - Competency scores across 8 key areas based on standard frameworks
   - Specific evidence from the conversation for each competency (actual quotes)
   - Patient scenario context for proper evaluation

6. **Viewing Assessments**:
   - Users can view their assessment history on the grading dashboard
   - They can search for specific assessments
   - They can view detailed results for any assessment
   - They can delete individual assessments or clear all history

## Integration Points

- **Session Controls**: The grading button is integrated into the session controls for easy access during conversations.
- **Header**: The grading dashboard is accessible via a navigation button in the header.
- **End Conversation**: Grading is automatically triggered when ending a conversation, using the real conversation data.
- **LLM API**: The system integrates with an LLM API for intelligent, evidence-based assessment.

## LLM Grading Framework

The LLM uses a comprehensive framework to assess healthcare communication skills:

1. **EMPATHY**: Ability to understand and share the feelings of the patient, showing compassion and emotional support.
2. **CLARITY**: Effectiveness in conveying information clearly, concisely, and in a way the patient can understand.
3. **CULTURAL_SENSITIVITY**: Awareness and respect for cultural differences, beliefs, and values that may impact healthcare decisions.
4. **ACTIVE_LISTENING**: Attentiveness to patient concerns, asking follow-up questions, and demonstrating understanding.
5. **MEDICAL_KNOWLEDGE**: Accuracy and appropriateness of medical information provided to the patient.
6. **PATIENT_EDUCATION**: Ability to explain medical concepts, treatment options, and self-care instructions effectively.
7. **RAPPORT_BUILDING**: Skill in establishing a positive, trusting relationship with the patient through effective communication.
8. **PROFESSIONALISM**: Maintaining appropriate boundaries, respect, and ethical conduct throughout the interaction.

## Configuration

The grading system has several configurable parameters:

- `minConversationLength`: The minimum number of conversation exchanges required for grading (default: 6)
- Competency areas and their metadata (icons, titles)
- Score levels and their visual styling (colors, labels)
- LLM model and parameters for assessment

## Future Enhancements

Potential future enhancements to the grading system:

1. **Server-side Storage**: Store assessment data on the server for persistence across devices
2. **Progress Tracking**: Add visualizations to track improvement over time
3. **Detailed Analytics**: Provide more detailed analytics on communication patterns
4. **Custom Rubrics**: Allow customization of the assessment criteria
5. **PDF Export**: Add the ability to export assessments as PDF files
6. **Comparative Analysis**: Compare performance across different scenarios or over time
