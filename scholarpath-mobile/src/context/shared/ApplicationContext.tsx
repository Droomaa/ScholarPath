import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';



import {

  type ActiveProgram,

  type ActiveProgramStatus,

  type ApplicationContextValue,

  type ApplicationState,

  type RegistrationApplication,

  type RegistrationStatus,

  type RegistrationStatusUpdate,

} from '@/src/types/shared/application';

import { type ProgramRegistrationDraft } from '@/src/types/shared/program-registration';

import { INSTITUTE_LINKED_REGISTRATIONS } from '@/src/features/institute/constants/institute-linked-registrations';



const ApplicationContext = createContext<ApplicationContextValue | null>(null);



const defaultState: ApplicationState = {

  activePrograms: [],

  registrations: INSTITUTE_LINKED_REGISTRATIONS,

  registrationDrafts: {},

};



export function ApplicationProvider({ children }: { children: ReactNode }) {

  const [state, setState] = useState<ApplicationState>(defaultState);



  const value = useMemo<ApplicationContextValue>(

    () => ({

      ...state,

      addActiveProgram: (program: ActiveProgram) =>

        setState((prev) => ({

          ...prev,

          activePrograms: [...prev.activePrograms, program],

        })),

      upsertActiveProgram: (program: ActiveProgram) =>

        setState((prev) => {

          const existing = prev.activePrograms.find(

            (item) => item.programId === program.programId

          );

          if (existing) {

            return {

              ...prev,

              activePrograms: prev.activePrograms.map((item) =>

                item.programId === program.programId

                  ? { ...item, ...program, id: item.id }

                  : item

              ),

            };

          }

          return {

            ...prev,

            activePrograms: [...prev.activePrograms, program],

          };

        }),

      findActiveProgramByProgramId: (programId: string) =>

        state.activePrograms.find((program) => program.programId === programId),

      updateActiveProgramStatus: (id: string, status: ActiveProgramStatus) =>

        setState((prev) => ({

          ...prev,

          activePrograms: prev.activePrograms.map((program) =>

            program.id === id ? { ...program, status } : program

          ),

        })),

      saveRegistrationDraft: (programId: string, draft: ProgramRegistrationDraft) =>

        setState((prev) => ({

          ...prev,

          registrationDrafts: {

            ...prev.registrationDrafts,

            [programId]: draft,

          },

        })),

      getRegistrationDraft: (programId: string) => state.registrationDrafts[programId],

      submitApplication: (activeProgramId: string, registration: RegistrationApplication) =>

        setState((prev) => {

          const activeProgram = prev.activePrograms.find((item) => item.id === activeProgramId);

          const programId = activeProgram?.programId ?? registration.programId;

          const nextDrafts = { ...prev.registrationDrafts };

          if (programId) {

            delete nextDrafts[programId];

          }



          return {

            ...prev,

            activePrograms: prev.activePrograms.filter((program) => program.id !== activeProgramId),

            registrations: [...prev.registrations, registration],

            registrationDrafts: nextDrafts,

          };

        }),

      removeActiveProgram: (activeProgramId: string) =>
        setState((prev) => {
          const activeProgram = prev.activePrograms.find((item) => item.id === activeProgramId);
          const nextDrafts = { ...prev.registrationDrafts };

          if (activeProgram?.programId) {
            delete nextDrafts[activeProgram.programId];
          }

          return {
            ...prev,
            activePrograms: prev.activePrograms.filter((program) => program.id !== activeProgramId),
            registrationDrafts: nextDrafts,
          };
        }),

      updateRegistrationStatus: (id: string, status: RegistrationStatus, updates?: RegistrationStatusUpdate) =>

        setState((prev) => ({

          ...prev,

          registrations: prev.registrations.map((item) => {

            if (item.id !== id) return item;

            const nowIso = new Date().toISOString();
            const next: RegistrationApplication = {
              ...item,
              status,
              updatedAt: updates?.updatedAt ?? nowIso,
            };

            if (updates?.reviewProgress !== undefined) {
              next.reviewProgress = updates.reviewProgress;
            }

            if (updates?.acceptedMessage) {
              next.acceptedMessage = updates.acceptedMessage;
            }

            if (updates?.rejectedFeedback) {
              next.rejectedFeedback = updates.rejectedFeedback;
            }

            if (status === 'accepted') {
              next.timeline = [
                {
                  title: 'Application Submitted',
                  subtitle: item.submittedAt ? `Completed on ${item.submittedAt}` : 'Completed',
                  status: 'done',
                },
                {
                  title: 'Institute Review',
                  subtitle: 'Review completed by institute',
                  status: 'done',
                },
                {
                  title: 'Accepted',
                  subtitle: updates?.acceptedMessage?.subtitle ?? 'Congratulations on your acceptance!',
                  status: 'done',
                },
              ];
            }

            if (status === 'rejected') {
              next.timeline = [
                {
                  title: 'Application Submitted',
                  subtitle: item.submittedAt ? `Completed on ${item.submittedAt}` : 'Completed',
                  status: 'done',
                },
                {
                  title: 'Institute Review',
                  subtitle: 'Application reviewed by institute',
                  status: 'done',
                },
                {
                  title: 'Not Selected',
                  subtitle: updates?.rejectedFeedback ?? 'Thank you for applying.',
                  status: 'done',
                },
              ];
            }

            return next;

          }),

        })),

    }),

    [state]

  );



  return (

    <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>

  );

}



export function useApplications() {

  const context = useContext(ApplicationContext);

  if (!context) {

    throw new Error('useApplications must be used within ApplicationProvider');

  }

  return context;

}

