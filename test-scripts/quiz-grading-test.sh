#!/bin/bash
echo '=== Quiz Auto-Grading Tests ==='
BASE='http://localhost:3000'
# Test submit quiz
echo 'Test 1: Submit quiz answers'
curl -sf -X POST $BASE/api/v1/quizzes/quiz1/submissions   -H 'Content-Type: application/json'   -d '{"studentId":"student1","answers":{"q1":"4","q2":"Photosynthesis uses light energy to convert CO2 into glucose."}}'
echo ''
echo 'Tests done'
