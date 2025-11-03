/**
 * Coach Exercise List Message
 * Affiche la liste des exercices avec chips cliquables
 */

import React from 'react';
import { motion } from 'framer-motion';

interface Exercise {
  id: string;
  name: string;
  orderIndex: number;
}

interface CoachExerciseListMessageProps {
  exercises: Exercise[];
  programType?: string;
  introText?: string;
  onExerciseClick: (exerciseId: string, exerciseName: string) => void;
  stepColor: string;
}

const CoachExerciseListMessage: React.FC<CoachExerciseListMessageProps> = ({
  exercises,
  programType,
  introText,
  onExerciseClick,
  stepColor
}) => {
  return (
    <div className="space-y-4">
      <p className="text-white/90 text-[15px] leading-relaxed">
        {introText || 'Parfait ! Voici les exercices de ta séance. Lequel souhaites-tu ajuster ?'}
      </p>

      <div className="flex flex-wrap gap-2">
        {exercises.map((exercise, index) => (
          <motion.button
            key={exercise.id}
            onClick={() => onExerciseClick(exercise.id, exercise.name)}
            className="exercise-chip"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              padding: '12px 20px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              backdropFilter: 'blur(12px)',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {exercise.orderIndex}. {exercise.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CoachExerciseListMessage;
