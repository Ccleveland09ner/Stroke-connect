import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './ui/Card';
import Button from './ui/Button';
import { BrainCircuit, ArrowLeft, ArrowRight } from 'lucide-react';

interface NIHSSCalculatorProps {
  onScoreCalculated: (score: number) => void;
  onClose: () => void;
}

interface NIHSSItem {
  id: string;
  title: string;
  description?: string;
  options: {
    value: number;
    label: string;
    description?: string;
  }[];
}

const nihssItems: NIHSSItem[] = [
  {
    id: 'loc',
    title: '1a. Level of Consciousness',
    description: 'Assess the patient\'s general responsiveness',
    options: [
      { value: 0, label: 'Alert', description: 'Keenly responsive' },
      { value: 1, label: 'Not alert but arousable', description: 'Responds to minor stimulation' },
      { value: 2, label: 'Not alert, requires repeated stimulation', description: 'Requires strong or repeated stimulus' },
      { value: 3, label: 'Unresponsive', description: 'Responds only with reflex movements or not at all' }
    ]
  },
  {
    id: 'locQuestions',
    title: '1b. LOC Questions',
    description: 'Ask patient the month and their age',
    options: [
      { value: 0, label: 'Answers both correctly', description: 'Must be exact' },
      { value: 1, label: 'Answers one correctly', description: 'Score 1 for partial response' },
      { value: 2, label: 'Answers neither correctly', description: 'No correct answers' }
    ]
  },
  {
    id: 'locCommands',
    title: '1c. LOC Commands',
    description: 'Ask patient to open/close eyes and grip/release hand',
    options: [
      { value: 0, label: 'Performs both tasks correctly', description: 'Must perform both actions correctly' },
      { value: 1, label: 'Performs one task correctly', description: 'Only one action performed correctly' },
      { value: 2, label: 'Performs neither task', description: 'Unable to perform either action' }
    ]
  },
  {
    id: 'bestGaze',
    title: '2. Best Gaze',
    description: 'Test horizontal eye movements',
    options: [
      { value: 0, label: 'Normal', description: 'Full range of horizontal movement' },
      { value: 1, label: 'Partial gaze palsy', description: 'Gaze is abnormal but not forced deviation' },
      { value: 2, label: 'Forced deviation', description: 'Total gaze paresis or forced deviation' }
    ]
  },
  {
    id: 'visualFields',
    title: '3. Visual Fields',
    description: 'Test visual fields by confrontation',
    options: [
      { value: 0, label: 'No visual loss', description: 'Normal visual fields' },
      { value: 1, label: 'Partial hemianopia', description: 'Partial visual field defect' },
      { value: 2, label: 'Complete hemianopia', description: 'Complete visual field loss in one hemifield' },
      { value: 3, label: 'Bilateral hemianopia', description: 'Bilateral visual field defect or blindness' }
    ]
  },
  {
    id: 'facialPalsy',
    title: '4. Facial Palsy',
    description: 'Ask patient to show teeth, raise eyebrows, and close eyes',
    options: [
      { value: 0, label: 'Normal', description: 'Symmetric movements' },
      { value: 1, label: 'Minor paralysis', description: 'Minor asymmetry' },
      { value: 2, label: 'Partial paralysis', description: 'Total or near-total paralysis of lower face' },
      { value: 3, label: 'Complete paralysis', description: 'Absent movement in upper and lower face' }
    ]
  },
  {
    id: 'leftArm',
    title: '5a. Left Arm Motor',
    description: 'Arm held at 90° (sitting) or 45° (supine) for 10 seconds',
    options: [
      { value: 0, label: 'No drift', description: 'Limb holds 90/45 degrees for full 10 seconds' },
      { value: 1, label: 'Drift', description: 'Drifts down but does not hit bed/support' },
      { value: 2, label: 'Some effort against gravity', description: 'Drifts to bed but has some effort against gravity' },
      { value: 3, label: 'No effort against gravity', description: 'Falls immediately to bed' },
      { value: 4, label: 'No movement', description: 'No voluntary movement' }
    ]
  },
  {
    id: 'rightArm',
    title: '5b. Right Arm Motor',
    description: 'Repeat for right arm',
    options: [
      { value: 0, label: 'No drift', description: 'Limb holds 90/45 degrees for full 10 seconds' },
      { value: 1, label: 'Drift', description: 'Drifts down but does not hit bed/support' },
      { value: 2, label: 'Some effort against gravity', description: 'Drifts to bed but has some effort against gravity' },
      { value: 3, label: 'No effort against gravity', description: 'Falls immediately to bed' },
      { value: 4, label: 'No movement', description: 'No voluntary movement' }
    ]
  },
  {
    id: 'leftLeg',
    title: '6a. Left Leg Motor',
    description: 'Leg held at 30° for 5 seconds',
    options: [
      { value: 0, label: 'No drift', description: 'Leg holds position for 5 seconds' },
      { value: 1, label: 'Drift', description: 'Drifts down but does not hit bed' },
      { value: 2, label: 'Some effort against gravity', description: 'Falls to bed within 5 seconds' },
      { value: 3, label: 'No effort against gravity', description: 'Falls immediately to bed' },
      { value: 4, label: 'No movement', description: 'No voluntary movement' }
    ]
  },
  {
    id: 'rightLeg',
    title: '6b. Right Leg Motor',
    description: 'Repeat for right leg',
    options: [
      { value: 0, label: 'No drift', description: 'Leg holds position for 5 seconds' },
      { value: 1, label: 'Drift', description: 'Drifts down but does not hit bed' },
      { value: 2, label: 'Some effort against gravity', description: 'Falls to bed within 5 seconds' },
      { value: 3, label: 'No effort against gravity', description: 'Falls immediately to bed' },
      { value: 4, label: 'No movement', description: 'No voluntary movement' }
    ]
  },
  {
    id: 'limb',
    title: '7. Limb Ataxia',
    description: 'Finger-nose-finger and heel-shin tests',
    options: [
      { value: 0, label: 'Absent', description: 'No ataxia' },
      { value: 1, label: 'Present in one limb', description: 'Ataxia in one limb' },
      { value: 2, label: 'Present in two limbs', description: 'Ataxia in two limbs' }
    ]
  },
  {
    id: 'sensory',
    title: '8. Sensory',
    description: 'Test sensation with pinprick',
    options: [
      { value: 0, label: 'Normal', description: 'No sensory loss' },
      { value: 1, label: 'Mild loss', description: 'Mild-to-moderate sensory loss' },
      { value: 2, label: 'Severe loss', description: 'Severe or total sensory loss' }
    ]
  },
  {
    id: 'language',
    title: '9. Language',
    description: 'Assess through standard commands and speech',
    options: [
      { value: 0, label: 'Normal', description: 'No aphasia' },
      { value: 1, label: 'Mild aphasia', description: 'Mild-to-moderate aphasia' },
      { value: 2, label: 'Severe aphasia', description: 'Severe aphasia' },
      { value: 3, label: 'Mute or global aphasia', description: 'Mute, global aphasia, or coma' }
    ]
  },
  {
    id: 'dysarthria',
    title: '10. Dysarthria',
    description: 'Assess clarity of speech',
    options: [
      { value: 0, label: 'Normal', description: 'Normal articulation' },
      { value: 1, label: 'Mild', description: 'Mild-to-moderate dysarthria' },
      { value: 2, label: 'Severe', description: 'Severe dysarthria, anarthria' }
    ]
  },
  {
    id: 'extinction',
    title: '11. Extinction/Inattention',
    description: 'Test for neglect or extinction to bilateral simultaneous stimulation',
    options: [
      { value: 0, label: 'Normal', description: 'No abnormality' },
      { value: 1, label: 'Mild', description: 'Visual, tactile, auditory, spatial, or personal inattention' },
      { value: 2, label: 'Severe', description: 'Profound hemi-inattention or extinction' }
    ]
  }
];

const NIHSSCalculator: React.FC<NIHSSCalculatorProps> = ({ onScoreCalculated, onClose }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [currentSection, setCurrentSection] = useState(0);
  
  const handleScoreChange = (itemId: string, value: number) => {
    setScores(prev => ({
      ...prev,
      [itemId]: value
    }));
    
    // Automatically move to next section after a brief delay
    if (currentSection < nihssItems.length - 1) {
      setTimeout(() => {
        setCurrentSection(currentSection + 1);
      }, 300);
    }
  };
  
  const calculateTotalScore = () => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    onScoreCalculated(totalScore);
  };

  const getSeverityClass = (score: number) => {
    if (score <= 4) return 'text-success-600';
    if (score <= 15) return 'text-warning-600';
    return 'text-error-600';
  };
  
  const currentItem = nihssItems[currentSection];
  const currentTotalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const progress = (Object.keys(scores).length / nihssItems.length) * 100;
  
  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="bg-primary-50 border-b border-primary-100">
        <div className="flex items-center space-x-3">
          <BrainCircuit className="h-6 w-6 text-primary-600" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">NIHSS Calculator</h3>
            <p className="text-sm text-gray-500">
              Section {currentSection + 1} of {nihssItems.length}
            </p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{Math.round(progress)}% Complete</span>
            <span>Current Score: <span className={getSeverityClass(currentTotalScore)}>{currentTotalScore}</span></span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-2 bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="mb-6">
            <h4 className="text-base font-medium text-gray-900 mb-2">
              {currentItem.title}
            </h4>
            {currentItem.description && (
              <p className="text-sm text-gray-500 mb-4">{currentItem.description}</p>
            )}
          </div>
          
          <div className="space-y-2">
            {currentItem.options.map(option => (
              <label
                key={option.value}
                className={`flex items-start p-3 rounded-lg border transition-colors cursor-pointer ${
                  scores[currentItem.id] === option.value
                    ? 'bg-primary-50 border-primary-200'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name={currentItem.id}
                  value={option.value}
                  checked={scores[currentItem.id] === option.value}
                  onChange={() => handleScoreChange(currentItem.id, option.value)}
                  className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    {option.value} - {option.label}
                  </span>
                  {option.description && (
                    <span className="block text-xs text-gray-500 mt-0.5">
                      {option.description}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center w-full">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSection(Math.min(nihssItems.length - 1, currentSection + 1))}
              disabled={currentSection === nihssItems.length - 1}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={calculateTotalScore}
              disabled={Object.keys(scores).length !== nihssItems.length}
            >
              Calculate Score
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NIHSSCalculator;