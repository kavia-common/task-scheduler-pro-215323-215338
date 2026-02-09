#!/bin/bash
cd /home/kavia/workspace/code-generation/task-scheduler-pro-215323-215338/task_scheduler_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

