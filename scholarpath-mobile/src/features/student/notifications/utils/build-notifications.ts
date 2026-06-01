import { EXPLORE_PROGRAMS, getProgramById } from '@/src/features/student/explore/constants/explore-programs';
import { getDeadlineCountdown } from '@/src/features/student/program/utils/deadline-countdown';
import { type ActiveProgram, type RegistrationApplication } from '@/src/types/shared/application';
import {
  type NotificationFilter,
  type NotificationSection,
  type StudentNotification,
} from '@/src/types/student/notification';
import { type StudentSessionState } from '@/src/types/student/student-session';

type BuildNotificationsInput = {
  registrations: RegistrationApplication[];
  activePrograms: ActiveProgram[];
  wishlistIds: string[];
  session: StudentSessionState;
  readIds: string[];
};

function withReadState(
  notification: Omit<StudentNotification, 'read'>,
  readIds: string[]
): StudentNotification {
  return {
    ...notification,
    read: readIds.includes(notification.id),
  };
}

function sortDateToIso(sortDate: number) {
  const value = String(sortDate);
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(4, 6)) - 1;
  const day = Number(value.slice(6, 8));
  return new Date(year, month, day, 9, 0, 0).toISOString();
}

function hoursAgoIso(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function buildApplicationNotifications(
  registrations: RegistrationApplication[],
  readIds: string[]
): StudentNotification[] {
  const items: StudentNotification[] = [];

  for (const registration of registrations) {
    const submittedAt = registration.submittedAt ?? registration.updatedAt ?? new Date().toISOString();

    items.push(
      withReadState(
        {
          id: `application-received-${registration.id}`,
          category: 'applications',
          title: 'Application Received',
          message: `Your application for ${registration.title} has been received.`,
          createdAt: submittedAt,
          icon: 'application',
          actionLabel: 'Track Application',
          actionHref: '/track-application',
        },
        readIds
      )
    );

    if (registration.status === 'review') {
      items.push(
        withReadState(
          {
            id: `application-review-${registration.id}`,
            category: 'applications',
            title: 'Application Under Review',
            message: `${registration.title} is currently being reviewed by the organizer.`,
            createdAt: hoursAgoIso(6),
            icon: 'application',
            actionLabel: 'Track Application',
            actionHref: '/track-application',
          },
          readIds
        )
      );

      if ((registration.reviewProgress ?? 0) >= 25) {
        items.push(
          withReadState(
            {
              id: `document-verified-${registration.id}`,
              category: 'applications',
              title: 'Document Verified',
              message: `Your documents for ${registration.title} have been successfully verified.`,
              createdAt: daysAgoIso(1),
              icon: 'verified',
              actionLabel: 'Track Application',
              actionHref: '/track-application',
            },
            readIds
          )
        );
      }
    }

    if (registration.status === 'accepted') {
      items.push(
        withReadState(
          {
            id: `application-accepted-${registration.id}`,
            category: 'applications',
            title: 'Application Accepted',
            message:
              registration.acceptedMessage?.title ??
              `Congratulations! Your application for ${registration.title} has been accepted.`,
            createdAt: registration.updatedAt ?? daysAgoIso(1),
            icon: 'verified',
            actionLabel: 'Track Application',
            actionHref: '/track-application',
          },
          readIds
        )
      );
    }

    if (registration.status === 'rejected') {
      items.push(
        withReadState(
          {
            id: `application-rejected-${registration.id}`,
            category: 'applications',
            title: 'Application Update',
            message:
              registration.rejectedFeedback ??
              `There is an update regarding your application for ${registration.title}.`,
            createdAt: registration.updatedAt ?? daysAgoIso(2),
            icon: 'deadline',
            actionLabel: 'Track Application',
            actionHref: '/track-application',
          },
          readIds
        )
      );
    }
  }

  return items;
}

function buildProgramNotifications(
  activePrograms: ActiveProgram[],
  wishlistIds: string[],
  session: StudentSessionState,
  readIds: string[]
): StudentNotification[] {
  const items: StudentNotification[] = [];

  for (const activeProgram of activePrograms) {
    const program = activeProgram.programId ? getProgramById(activeProgram.programId) : undefined;

    if (activeProgram.status === 'incomplete_documents') {
      items.push(
        withReadState(
          {
            id: `incomplete-documents-${activeProgram.id}`,
            category: 'applications',
            title: 'Complete Your Documents',
            message: `Documents for ${activeProgram.title} are still incomplete. Submit before the deadline.`,
            createdAt: hoursAgoIso(3),
            icon: 'deadline',
            actionLabel: 'Complete Documents',
            actionHref: activeProgram.programId
              ? `/program-register/${activeProgram.programId}?activeId=${activeProgram.id}`
              : '/application',
          },
          readIds
        )
      );
    }

    if (program?.deadlineAt) {
      const countdown = getDeadlineCountdown(program.deadlineAt);
      if (!countdown.expired && countdown.days <= 7) {
        items.push(
          withReadState(
            {
              id: `deadline-reminder-${activeProgram.programId ?? activeProgram.id}`,
              category: 'applications',
              title: 'Deadline Reminder',
              message: `The deadline for '${program.title}' is in ${countdown.days} day${countdown.days === 1 ? '' : 's'}.`,
              createdAt: daysAgoIso(2),
              icon: 'deadline',
              actionLabel: 'View Program',
              actionHref: `/program/${program.id}`,
            },
            readIds
          )
        );
      }
    }
  }

  const educationLevel = session.educationLevel;
  const matchingPrograms =
    educationLevel === ''
      ? EXPLORE_PROGRAMS
      : EXPLORE_PROGRAMS.filter((program) =>
          program.educationLevels.includes(educationLevel)
        );

  const newestPrograms = matchingPrograms.sort((a, b) => b.sortDate - a.sortDate).slice(0, 2);

  for (const program of newestPrograms) {
    items.push(
      withReadState(
        {
          id: `new-program-${program.id}`,
          category: 'programs',
          title: 'New Program Available',
          message: `${program.title} from ${program.provider} is now open for registration.`,
          createdAt: sortDateToIso(program.sortDate),
          icon: 'program',
          actionLabel: 'View Program',
          actionHref: `/program/${program.id}`,
        },
        readIds
      )
    );
  }

  for (const wishlistId of wishlistIds) {
    const program = getProgramById(wishlistId);
    if (!program?.deadlineAt) continue;

    const countdown = getDeadlineCountdown(program.deadlineAt);
    if (!countdown.expired && countdown.days <= 3) {
      items.push(
        withReadState(
          {
            id: `wishlist-deadline-${program.id}`,
            category: 'programs',
            title: 'Saved Program Deadline',
            message: `'${program.title}' in your wishlist closes soon. Register before it's too late.`,
            createdAt: daysAgoIso(1),
            icon: 'deadline',
            actionLabel: 'View Program',
            actionHref: `/program/${program.id}`,
          },
          readIds
        )
      );
    }
  }

  return items;
}

function buildSystemNotifications(
  session: StudentSessionState,
  readIds: string[]
): StudentNotification[] {
  const items: StudentNotification[] = [];

  if (session.interests.length > 0) {
    items.push(
      withReadState(
        {
          id: 'ai-profile-match',
          category: 'system',
          title: 'AI Profile Match',
          message: 'We found new programs that match your profile!',
          createdAt: hoursAgoIso(2),
          icon: 'ai',
          actionLabel: 'View Programs',
          actionHref: '/explore',
        },
        readIds
      )
    );
  }

  if (session.fullName && session.educationLevel) {
    items.push(
      withReadState(
        {
          id: 'welcome-scholarpath',
          category: 'system',
          title: 'Welcome to ScholarPath',
          message: `Hi ${session.fullName.split(' ')[0]}, explore scholarships and competitions tailored for you.`,
          createdAt: daysAgoIso(3),
          icon: 'system',
          actionLabel: 'Explore',
          actionHref: '/explore',
        },
        readIds
      )
    );
  }

  return items;
}

export function buildStudentNotifications({
  registrations,
  activePrograms,
  wishlistIds,
  session,
  readIds,
}: BuildNotificationsInput): StudentNotification[] {
  const notifications = [
    ...buildApplicationNotifications(registrations, readIds),
    ...buildProgramNotifications(activePrograms, wishlistIds, session, readIds),
    ...buildSystemNotifications(session, readIds),
  ];

  return notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function groupNotificationsBySection(
  notifications: StudentNotification[]
): NotificationSection[] {
  const recent = notifications.filter((item) => {
    const diffMs = Date.now() - new Date(item.createdAt).getTime();
    return diffMs < 24 * 60 * 60 * 1000;
  });
  const earlier = notifications.filter((item) => {
    const diffMs = Date.now() - new Date(item.createdAt).getTime();
    return diffMs >= 24 * 60 * 60 * 1000;
  });

  const sections: NotificationSection[] = [];

  if (recent.length > 0) {
    sections.push({ id: 'recent', label: 'RECENT', items: recent });
  }
  if (earlier.length > 0) {
    sections.push({ id: 'earlier', label: 'EARLIER', items: earlier });
  }

  return sections;
}

export function filterNotifications(
  notifications: StudentNotification[],
  filter: NotificationFilter
) {
  if (filter === 'all') {
    return notifications;
  }
  return notifications.filter((item) => item.category === filter);
}
