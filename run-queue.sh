#!/bin/bash

# Define files
PROMPT_FILE="prompts.txt"
LOG_FILE="agy_execution_log.txt"
SESSION_FILE="my_automation_session.json"

# Clear previous logs if they exist
echo "=== Antigravity CLI Automation Log - $(date) ===" > "$LOG_FILE"

# Loop through each prompt
while IFS= read -r prompt || [ -n "$prompt" ]; do
    # Skip empty lines or comments
    [[ -z "$prompt" || "$prompt" =~ ^# ]] && continue
    
    echo "========================================" >> "$LOG_FILE"
    echo "PROMPT: $prompt" >> "$LOG_FILE"
    echo "TIME: $(date)" >> "$LOG_FILE"
    echo "========================================" >> "$LOG_FILE"
    
    echo "🚀 Executing: $prompt..."
    
    # Run agy with session tracking and append both output and errors to log
    agy --dangerously-skip-permissions \
        --session "$SESSION_FILE" \
        -p "$prompt" >> "$LOG_FILE" 2>&1
        
    echo "" >> "$LOG_FILE" # Add a newline spacer
done < "$PROMPT_FILE"

echo "✅ All prompts executed! Log saved to $LOG_FILE"
