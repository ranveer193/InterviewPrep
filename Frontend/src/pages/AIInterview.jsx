import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Video, Mic, Square, Play, RotateCcw, CheckCircle, Home, FileText, Star, Clock, TrendingUp } from "lucide-react";

export default function AIInterview() {
  const navigate = useNavigate();
  const { company } = useParams();
  
  // Decode the company parameter from URL
  const decodedCompany = company ? decodeURIComponent(company) : null;
  
  const showCompanySelection = !decodedCompany;
  
  // Interview state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [stream, setStream] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  
  const videoRef = useRef(null);
  const recordedVideoRef = useRef(null);
  const chunksRef = useRef([]);
  
  // Sample questions for different companies
  const sampleQuestions = {
    'Amazon': [
      "Tell me about a time when you had to deal with a difficult customer or colleague.",
      "Describe a situation where you had to make a decision with incomplete information.",
      "How do you handle competing priorities and deadlines?"
    ],
    'Google': [
      "Explain how you would design a scalable system to handle millions of users.",
      "Tell me about a challenging technical problem you solved recently.",
      "How do you stay updated with the latest technology trends?"
    ],
    'Microsoft': [
      "Describe a project where you had to work with a diverse team.",
      "How do you approach debugging complex software issues?",
      "Tell me about a time when you had to learn a new technology quickly."
    ],
    'Apple': [
      "How do you ensure quality in your work?",
      "Describe a time when you had to think outside the box to solve a problem.",
      "How do you handle feedback and criticism?"
    ],
    'Meta': [
      "Tell me about a time when you had to influence others without authority.",
      "How do you approach data-driven decision making?",
      "Describe a situation where you had to adapt to significant changes."
    ]
  };
  
  // Mock AI-generated interview summary
  const mockInterviewSummary = {
    overallScore: 8.2,
    confidence: 7.8,
    communication: 8.5,
    technicalKnowledge: 7.9,
    problemSolving: 8.1,
    strengths: [
      "Excellent communication skills with clear articulation",
      "Strong problem-solving approach with structured thinking",
      "Good technical knowledge demonstrated in responses",
      "Professional demeanor throughout the interview"
    ],
    areasForImprovement: [
      "Could provide more specific examples in some responses",
      "Consider elaborating on technical details when relevant",
      "Practice more concise answers for time-sensitive questions"
    ],
    recommendations: [
      "Continue practicing behavioral questions with STAR method",
      "Prepare more specific examples from your experience",
      "Work on technical depth for system design questions",
      "Practice time management for interview responses"
    ],
    questionAnalysis: [
      {
        question: "Tell me about a time when you had to deal with a difficult customer or colleague.",
        score: 8.5,
        feedback: "Good use of STAR method. Clear situation and action described."
      },
      {
        question: "Describe a situation where you had to make a decision with incomplete information.",
        score: 7.8,
        feedback: "Demonstrated logical thinking. Could provide more specific details."
      },
      {
        question: "How do you handle competing priorities and deadlines?",
        score: 8.1,
        feedback: "Excellent prioritization framework. Well-structured response."
      }
    ]
  };
  
  // Handle company selection
  const handleCompanySelect = (selectedCompany) => {
    const url = `/ai-interview/${encodeURIComponent(selectedCompany)}`;
    navigate(url);
  };
  
  // Load questions when company is selected
  useEffect(() => {
    if (decodedCompany && sampleQuestions[decodedCompany]) {
      setQuestions(sampleQuestions[decodedCompany]);
    }
  }, [decodedCompany]);
  
  // Cleanup camera stream when interview completes or component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
  }, [stream]);
  
  // Stop camera when interview completes
  useEffect(() => {
    if (interviewCompleted && stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  }, [interviewCompleted, stream]);
  
  // Start recording
  const startRecording = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      const recorder = new MediaRecorder(mediaStream);
      const chunks = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        chunksRef.current = [];
        
        // Create preview URL for recorded video
        if (recordedVideoRef.current) {
          recordedVideoRef.current.src = URL.createObjectURL(blob);
        }
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      alert('Unable to access camera/microphone. Please check permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };
  
  // Show preview of recorded video
  const handleShowPreview = () => {
    setShowPreview(true);
  };
  
  // Submit recording
  const submitRecording = async () => {
    if (!recordedBlob) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Recording submitted successfully!');
      setRecordedBlob(null);
      setShowPreview(false);
      
      // Check if this was the last question
      if (currentQuestion + 1 >= questions.length) {
        setInterviewCompleted(true);
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    }, 2000);
  };
  
  // Reset recording
  const resetRecording = () => {
    setRecordedBlob(null);
    setShowPreview(false);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (recordedVideoRef.current) {
      recordedVideoRef.current.src = '';
    }
  };
  
  // Show company selection if no company is selected
  if (showCompanySelection) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Home
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Choose Company for AI Interview
                </h1>
                <p className="text-gray-600 mt-1">Select a company to start your practice interview</p>
              </div>
              
              <div className="w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {['Amazon', 'Google', 'Microsoft', 'Apple', 'Meta'].map((companyName) => (
              <div
                key={companyName}
                onClick={() => handleCompanySelect(companyName)}
                className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
              >
                <div className="text-center">
                  {/* <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                    <span className="text-white font-bold text-xl">{companyName.charAt(0)}</span>
                  </div> */}
                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                    {companyName}
                  </h4>
                  <h1 className="text-sm text-gray-500 mb-4">
                    Start practice with {companyName} interview questions.
                  </h1>
                  <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium">
                    Start Interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Show interview summary
  if (showSummary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSummary(false)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Results
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Interview Summary
                </h1>
                <p className="text-gray-600 mt-1">Detailed analysis of your {decodedCompany} interview performance</p>
              </div>
              
              <div className="w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Overall Score */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Performance Score</h2>
              <div className="flex items-center justify-center gap-4">
                <div className="text-6xl font-bold text-blue-500">{mockInterviewSummary.overallScore}</div>
                <div className="text-2xl text-gray-400">/ 10</div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-5 h-5 ${i < Math.floor(mockInterviewSummary.overallScore / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
            
            {/* Score Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">{mockInterviewSummary.confidence}</div>
                <div className="text-sm text-gray-600">Confidence</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">{mockInterviewSummary.communication}</div>
                <div className="text-sm text-gray-600">Communication</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{mockInterviewSummary.technicalKnowledge}</div>
                <div className="text-sm text-gray-600">Technical</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-bold text-orange-600">{mockInterviewSummary.problemSolving}</div>
                <div className="text-sm text-gray-600">Problem Solving</div>
              </div>
            </div>
          </div>
          
          {/* Strengths */}
          <div className="bg-white border border-green-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Key Strengths
            </h3>
            <ul className="space-y-2">
              {mockInterviewSummary.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Areas for Improvement */}
          <div className="bg-white border border-yellow-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {mockInterviewSummary.areasForImprovement.map((area, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Recommendations */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {mockInterviewSummary.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Question Analysis */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Question-by-Question Analysis</h3>
            <div className="space-y-4">
              {mockInterviewSummary.questionAnalysis.map((qa, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Question {index + 1}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-600">Score:</span>
                      <span className="text-lg font-bold text-blue-600">{qa.score}/10</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{qa.question}</p>
                  <p className="text-gray-700 text-sm">{qa.feedback}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => setShowSummary(false)}
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Back to Results
            </button>
            <button
              onClick={() => navigate('/ai-interview')}
              className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Try Another Company
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Show finish interview screen
  if (interviewCompleted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate('/ai-interview')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to AI Interview
              </button>
              
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  Interview Completed
                </h1>
                <p className="text-gray-600 mt-1">Great job! You've completed the {decodedCompany} interview</p>
              </div>
              
              <div className="w-24"></div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white border border-blue-200 rounded-2xl p-8 shadow-sm text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Congratulations! 🎉
            </h2>
            
            <p className="text-lg text-gray-600 mb-6">
              You have successfully completed the {decodedCompany} AI Interview practice session.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Interview Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Company:</span>
                  <p className="font-medium text-gray-900">{decodedCompany}</p>
                </div>
                <div>
                  <span className="text-gray-600">Questions Answered:</span>
                  <p className="font-medium text-gray-900">{questions.length} of {questions.length}</p>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <p className="font-medium text-green-600">Completed</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowSummary(true)}
                className="w-full bg-purple-500 text-white py-3 px-6 rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Summary of Your Interview
              </button>
              
              <button
                onClick={() => {
                  setInterviewCompleted(false);
                  setCurrentQuestion(0);
                  setRecordedBlob(null);
                  setShowPreview(false);
                }}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Practice Again
              </button>
              
              <button
                onClick={() => navigate('/ai-interview')}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Try Another Company
              </button>
              
              <button
                onClick={() => navigate('/')}
                className="w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show specific company interview
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/ai-interview')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to AI Interview
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                AI Interview - {decodedCompany}
              </h1>
              <p className="text-gray-600 mt-1">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            
            <div className="w-24"></div>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Question Card */}
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{currentQuestion + 1}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Question {currentQuestion + 1}
            </h2>
          </div>
          <p className="text-gray-700 text-lg leading-relaxed">
            {questions[currentQuestion]}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Video Preview</h3>
            </div>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover"
              />
              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Camera preview will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Recording Controls */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Mic className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Recording Controls</h3>
            </div>
            
            {isRecording && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <p className="text-red-700 font-medium">
                    Recording... Click "Stop Recording" when you're done
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {!isRecording && !recordedBlob && (
                <button
                  onClick={startRecording}
                  className="w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Mic className="w-5 h-5" />
                  Start Recording
                </button>
              )}
              
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </button>
              )}
              
              {recordedBlob && !showPreview && (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">Recording completed!</p>
                  </div>
                  
                  <button
                    onClick={handleShowPreview}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Play className="w-4 h-4" />
                    Preview Recording
                  </button>
                  
                  <button
                    onClick={resetRecording}
                    className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Record Again
                  </button>
                </div>
              )}
              
              {showPreview && (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 font-medium">Preview your recording</p>
                  </div>
                  
                  <button
                    onClick={submitRecording}
                    disabled={isLoading}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    {isLoading ? 'Submitting...' : currentQuestion + 1 === questions.length ? 'Finish Interview' : 'Submit Answer'}
                  </button>
                  
                  <button
                    onClick={() => setShowPreview(false)}
                    className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    Back to Recording
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Recorded Video Preview */}
        {showPreview && recordedBlob && (
          <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Play className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">Your Recording Preview</h3>
            </div>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-video">
              <video
                ref={recordedVideoRef}
                controls
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-gray-600 mt-3 text-sm">
              Review your answer before submitting. You can play, pause, and scrub through the video.
            </p>
          </div>
        )}
        
        {/* Progress */}
        <div className="mt-6 bg-white border border-blue-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-2 text-sm">
            {currentQuestion + 1} of {questions.length} questions completed
          </p>
        </div>
      </div>
    </div>
  );
} 