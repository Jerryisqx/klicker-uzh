export default {
  shared: {
    questions: {
      roundedTo: 'Round to {accuracy} decimal places.',
      numInvalidValue:
        'The entered value is not a number or is not in the specified range.',
      ftPlaceholder: 'Your answer...',
    },
    SC: {
      typeLabel: 'Single Choice (SC)',
      text: 'Please select a single option.',
      richtext: 'Please select a <b>single</b> option.',
    },
    MC: {
      typeLabel: 'Multiple Choice (MC)',
      text: 'Please select one or more options.',
      richtext: 'Please select <b>one or more</b> options.',
    },
    KPRIM: {
      typeLabel: 'KPRIM (KP)',
      text: 'Evaluate the statements for correctness.',
      richtext: 'Evaluate the statements for <b>correctness</b>.',
    },
    FREE_TEXT: {
      typeLabel: 'Free Text (FT)',
      text: 'Please enter your answer.',
      richtext: 'Please enter your <b>answer</b>.',
    },
    NUMERICAL: {
      typeLabel: 'Numerical (NR)',
      text: 'Please enter a number.',
      richtext: 'Please enter a <b>number</b>.',
    },
    login: {
      installButton: 'Install Now',
    },
    generic: {
      profile: 'Profile',
      yes: 'Yes',
      no: 'No',
      draft: 'Draft',
      published: 'Published',
      points: 'Points',
      title: 'KlickerUZH',
      send: 'Send',
      save: 'Save',
      start: 'Start',
      continue: 'Continue',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      sendAnswer: 'Send answer',
      begin: 'Begin',
      finish: 'Finish',
      logout: 'Logout',
      login: 'Login',
      username: 'Username',
      email: 'E-mail address',
      password: 'Password',
      token: 'Token',
      passwordRepetition: 'Password (repetition)',
      signin: 'Login',
      usernameError: 'Please enter your username.',
      passwordError: 'Please enter your password.',
      loginError: 'The username or password are incorrect.',
      systemError: 'An unexpected error occurred. Please try again later.',
      error: 'Error',
      back: 'Back',
      home: 'Home',
      questions: 'Questions',
      question: 'Question',
      feedbacks: 'Feedbacks',
      feedback: 'Feedback',
      explanation: 'Explanation',
      leaderboard: 'Leaderboard',
      repetition: 'Repetition',
      evaluation: 'Evaluation',
      liveSession: 'Live Session',
      learningElement: 'Learning Element',
      learningElements: 'Learning Elements',
      microSessions: 'Micro Sessions',
      microlearning: 'Microlearning',
      activeSessions: 'Active Sessions',
      characters: 'characters',
      precision: 'Precision',
      unit: 'Unit',
      min: 'Min',
      minLong: 'Minimum',
      max: 'Max',
      maxLong: 'Maximum',
      free: 'Free',
      congrats: 'Congratulations!',
      thanks: 'Thank you!',
      bookmarks: 'Bookmarks',
      group: 'Group',
      create: 'Create',
      join: 'Join',
      leave: 'Leave',
      documentation: 'Documentation',
      features: 'Features',
      groupActivities: 'Group activities',
      experiencePoints: 'Experience points',
      level: 'Level',
      levelX: 'Level: {number}',
      solution: 'Solution',
      sampleSolution: 'Sample solution',
      gamification: 'Gamification',
      multiplier: 'Multiplier',
      options: 'Options',
      correct: 'Correct',
      delete: 'Delete',
      edit: 'Edit',
      duplicate: 'Duplicate',
      preview: 'Preview',
      createdAt: 'Created at {date}',
      updatedAt: 'Edited at {date}',
      startAt: 'Start at {time}',
      finishedAt: 'Finished at {time}',
      description: 'Description',
      settings: 'Settings',
      course: 'Course',
      startDate: 'Start date',
      endDate: 'End date',
      repetitionInterval: 'Repetition interval',
      order: 'Order',
      link: 'Link',
      respond: 'Respond',
      responses: 'Responses',
      ok: 'OK',
    },
    contentInput: {
      boldStyle:
        'Select this setting for bold text. The same can also be achieved with the standard keyboard shortcut cmd/ctrl+b.',
      italicStyle:
        'Select this setting for italic text. The same can also be achieved with the standard keyboard shortcut cmd/ctrl+i.',
      codeStyle: 'Select this setting for code styling.',
      citationStyle:
        'Select this option to insert a citation. Please note that currently new paragraphs (by a line break / Enter) are displayed as separate citations.',
      numberedList:
        'This option creates a numbered list. To create new points, simply insert a new line after an existing element. To return to standard text, press this button again.',
      unnumberedList:
        'This option creates an unnumbered list. To create new points, simply insert a new line after an existing element. To return to standard text, press this button again.',
      image:
        'Select this setting to include an image. Use the same syntax to include formulas in answer options.',
      latex:
        'Select this setting to include an inline LaTeX formula. Use the same syntax to include formulas in answer options.',
      latexCentered:
        'Select this setting to include a LaTeX formula centered on a separate line.',
    },
    leaderboard: {
      sessionTitle: 'Session Leaderboard',
      ranks: 'Ranks',
      points: 'Points',
      computed: 'Computed',
      collected: 'Collected',
      pointsCollected: 'Points (collected)',
      participantCount: 'Number of participants: {number}',
      groupCount: 'Number of groups: {number}',
      averagePoints: 'Average points: {number}',
      noPointsCollected:
        'No points have been collected in this session so far. As soon as this changes, podium and leaderboard will be displayed here.',
    },
    error: {
      404: '404 Page not found',
      pwaWithoutUser:
        'Sorry, the page you requested does not exist. You can <login>sign in</login> to see an overview of all KlickerUZH elements your courses offer.',
      pwaWithUser:
        'Sorry, the page you requested does not exist. View an <home>overview</home> of all KlickerUZH elements your courses offer.',
      offlineHint:
        'You seem to be offline at the moment. Connect your device to the Internet to use the KlickerUZH app.',
    },
  },
  auth: {
    authentication: 'Authentication',
    delegatedAccess: 'Delegated Access',
    signedInAs: 'Signed in as {username}',
    tosAgreement:
      'I consent to the KlickerUZH <tos></tos> and <privacy></privacy>.',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    tosUrl: 'https://www.klicker.uzh.ch/terms_of_service',
    privacyUrl: 'https://www.klicker.uzh.ch/privacy_policy',
  },
  pwa: {
    general: {
      myCourses: 'My Courses',
      myBookmarks: 'My Bookmarks',
      joinCourse: 'Join Course',
      setupProfile: 'Setup profile',
      openInBrowser: 'Open in browser',
      selectCourse: 'Select course',
      setup: 'Log-in and App-Installation',
      appSetup: 'Installation of the KlickerUZH-App',
      firstLogin: 'First login and profile setup',
      polls: 'Polls',
      liveQA: 'Live-Q&A',
      userNotLoggedIn:
        'You are currently not logged in. <login>Please log in</login> if you want to collect points and XP and see an overview of your learning progress.',
      noSessionsActive: 'No sessions active.',
      activeSessionsBy: 'Active sessions by <i>{name}</i>',
      joinLeaderboardNotice: `
🎊 A warm welcome, {username}, to the course "{courseName}" 🎊

You are currently **not** participating in the course leaderboard, meaning that you can participate in all activities but will not collect any points, will not be listed on the leaderboard, and will not be eligible for achievements and awards. If you would like to participate in the gamified activities throughout this course, **click the button** below to join. You can leave the course leaderboard at any time, upon which all of your collected points will be **deleted**.

Other participants will only see your public **participant profile**, including pseudonym and total points/achievements on leaderboards. You can choose to hide your profile from other participants while still participating in the leaderboard, if you wish to do so (see [here](/editProfile)).
`,
    },
    createAccount: {
      dataCollectionNotice:
        'We collect and store the profile information of your created participant account (e.g., email, pseudonym, password) as well as the data that arises during your interactions with courses (e.g., created groups) and completed activities (e.g., answers to questions asked). If you decide to participate in the optional leaderboard as part of a course, we additionally collect and store the accumulated scores as part of all activities.',
      dataSharingNotice: `
When you create an account and participate in courses and activities using KlickerUZH, the owners of the KlickerUZH accounts related to your courses will be able to see your **e-mail address** alongside some information on the KlickerUZH activities you participated in, and might use this information for the purpose of teaching their course with KlickerUZH, or, in **anonymized** form, for research purposes outside of KlickerUZH. They are required to inform you about any such use of your data beside the use within KlickerUZH.

The **detailed content** of your questions (e.g., in Live Q&A) or responses (e.g., in quizzes) will be shared with the owners of the KlickerUZH accounts only in **aggregate or anonymized form**. Only **nonsensitive** information like the number of interactions with, and collected points in activities, if you choose to participate in the leaderboard, will be shared in an identifiable way.

Your data will never be shared with other parties beside the above and will never be used for commercial purposes (e.g., marketing).`,
      dataUsageNotice:
        'Your data is being used to provide the functionalities made available to you by KlickerUZH. Further analysis of any of the collected data outside of the KlickerUZH platform may only be performed in anonymized form and only for the purpose of teaching and research. Lecturers are obligated to inform you appropriately about any research that is being performed on your collected data.',
      dataStorageNotice:
        'Your account data, such as profile information, achievements, and experience points, as well as responses you give to questions in the KlickerUZH, will be stored for the lifetime of your account. Your points and ranking on course activities and leaderboards will be stored for as long as you participate on the respective course leaderboard. You can request deletion of your data and account at any time.',
      confirmationMessage:
        'I agree to the KlickerUZH [privacy policy](https://www.klicker.uzh.ch/privacy_policy) and [terms of service](https://www.klicker.uzh.ch/terms_of_service) and consent to the processing of my data as described therein. I am aware that I can participate in learning activities anonymously and without an account if I do not agree to these conditions.',
    },
    login: {
      installAndroid:
        'Install the KlickerUZH app on your phone to receive push notifications when new learning content is available.',
      installIOS:
        "Open the Share dialog and click 'Add to Home Screen' to install the KlickerUZH app on your phone.",
    },
    courses: {
      courseInformation: 'Course Information',
      createJoinGroup: 'Create/Join Group',
      createGroup: 'Create Group',
      joinGroup: 'Join Group',
      groupName: 'Group Name',
      code: 'Code',
      individualLeaderboard: 'Individual Leaderboard',
      groupLeaderboard: 'Group Leaderboard',
      individualLeaderboardUpdate:
        'The individual leaderboard will be updated hourly.',
      noGroups: "No groups have been created yet. Let's go!",
      noGroupPoints: "No group points have been collected yet. Let's go!",
      groupLeaderboardUpdate:
        'The group leaderboard will be updated daily.<b>x</b>Groups with a single member will not receive any points.',
      joinLeaderboardCourse: 'Join the leaderboard for <b>{name}</b>',
      membersScore: 'Points by group members',
      groupActivityScore: 'Points by group activities',
      totalScore: 'Total points',
      bookmarkedQuestionsTitle: 'Bookmarks for {courseName}',
      bookmarkedQuestionsDesc:
        'This page allows you to repeat all questions with bookmarks from the course {courseName}. They will be displayed as a regular learning element.',
      noBooksmarksSet:
        'You have not bookmarked any questions yet. Simply click on the bookmark symbol on a question for this.',
      awards: 'Awards',
      open: 'open',
    },
    joinCourse: {
      title: 'Join Course "{name}"',
      introLoggedIn:
        'You are already logged in and can join the course {name} directly by entering the correct PIN.',
      introLoggedInNoCourse:
        'You are already logged in and can join a course directly by entering the corresponding PIN.',
      introNewUser:
        'Create your KlickerUZH account for the course {name} here. If you already have an account, you can enter the corresponding login data directly in the form.',
      coursePinFormat: 'Course-PIN (format: ### ### ###)',
      coursePinNumerical: 'Please enter a numerical course PIN.',
      coursePinRequired: 'Please enter the course PIN.',
    },
    learningElement: {
      notFound:
        'The corresponding learning element is either not available or not yet published.',
      repetitionTitle: 'Repetition learning elements',
      noRepetition:
        'There are currently no learning elements available for repetition.',
      numOfQuestions: 'Number of questions: {number}',
      orderLAST_RESPONSE: 'Order: last answered questions at the end',
      orderSHUFFLED: 'Order: random order',
      orderSEQUENTIAL: 'Order: ordered in sequence',
      repetitionDaily: 'Repetition: daily',
      repetitionXDays: 'Repetition: every {days} days',
      answeredMinOnce: 'Min. answered once: {answered}/{total}',
      multiplicatorPoints: 'Multiplicator: {mult}x points',
      multiplicatorEval: '<b>Multiplicator</b> {mult}x',
      solvedLearningElement:
        'You have successfully completed the learning element <it>{name}</it>.',
      pointsCollectedPossible: 'Points (collected/computed/available)',
      notAttempted: 'Not attempted',
      totalPoints: 'Total points (collected): {points}',
      totalXp: '{xp} XP collected',
      questionTypeNotSupported:
        'This question type is currently not available for learning elements',
      newPointsFrom: 'New points/XP from:',
      othersAnswered: 'Others answered as follows',
      flagQuestion: 'Report question',
      flagQuestionText:
        'This feedback form is intended to allow you to make a direct comment on the individual questions of a learning element / micro-session, should an error have crept in. The lecturer will receive a message with your feedback. Therefore, please try to describe the error as accurately as possible.',
      addFeedback: 'Add feedback',
      feedbackRequired: 'Please add a text to your feedback.',
      submitFeedback: 'Submit feedback',
      feedbackTransmitted: 'Your feedback has been transmitted successfully.',
      infoStack: 'Information element',
    },
    microSession: {
      notFound:
        'The corresponding micro session is either not available or not yet active.',
      solvedMicrolearning:
        'You have successfully completed the microlearning <it>{name}</it>.',
    },
    session: {
      noActiveQuestion: 'No question active.',
      allQuestionsAnswered: 'You have already answered all active questions.',
    },
    feedbacks: {
      title: 'Feedback Channel',
      speed: 'Speed',
      difficulty: 'Difficulty',
      openQuestions: 'Open Questions',
      resolvedQuestions: 'Resolved Questions',
      feedbackPlaceholder: 'Enter your question / feedback',
      postedAt: 'Posted at {date}',
      solvedAt: 'Resolved at {date}',
    },
    profile: {
      publicProfile: 'Profile Visibility',
      isProfilePublic:
        'Should your profile and pseudonym be displayed to other participants? If you deactivate this option, you will be displayed as Anonymous to other participants. Note that you will see all other participants as Anonymous as well.',
      editProfile: 'Edit profile',
      editProfileFailed:
        'Unfortunately, an error occurred while saving the changes. The username you have chosen may already be taken. Please check your entries and try again.',
      achievements: 'Achievements',
      myProfile: 'My Profile',
      createProfile: 'Create Profile',
      usernameMinLength:
        'The username must be at least {length} characters long.',
      usernameMaxLength:
        'The username must not be longer than {length} characters.',
      passwordMinLength:
        'The password must be at least {length} characters long.',
      identicalPasswords: 'Passwords must match.',
      emailRequired: 'Please enter an e-mail address.',
      emailInvalid: 'Please enter a valid e-mail address.',
      usernameRequired: 'Please enter a username here.',
      passwordRequired: 'Please enter a password here.',
      welcomeMessage:
        'Welcome to KlickerUZH! If this is your first time here, please set a password and define your own username and avatar.',
      deleteProfile: 'Delete Account',
      deleteProfileDescription:
        'Deleting your KlickerUZH account will irreversibly delete all associated data.',
      deleteProfileConfirmation:
        'Are you sure you want to delete your account? All data related to your account will be deleted. This action cannot be undone.',
      privacyDataCollection: '',
      privacyDataSharing: '',
      privacyDataUsage: '',
      privacyDataStorage: '',
    },
    avatar: {
      hair: 'Hair',
      hairColor: 'Hair Color',
      eyes: 'Eyes',
      accessory: 'Glasses',
      mouth: 'Mouth',
      facialHair: 'Facial Hair',
      clothing: 'Clothing',
      clothingColor: 'Clothing Color',
      skinTone: 'Skin Tone',
      breasts: 'Female',
      chest: 'Male',
      normal: 'Normal',
      happy: 'Happy',
      content: 'Content',
      squint: 'Focused',
      heart: 'Hearts',
      light: 'Light',
      dark: 'Dark',
      long: 'Long',
      bun: 'Bun',
      short: 'Short',
      buzz: 'Very short',
      afro: 'Afro',
      blonde: 'Blonde',
      black: 'Black',
      brown: 'Brown',
      white: 'White',
      blue: 'Blue',
      green: 'Green',
      red: 'Red',
      grin: 'Grin',
      openSmile: 'Open Smile',
      open: 'Open',
      serious: 'Serious',
      tongue: 'Tongue',
      none: 'None',
      roundGlasses: 'Standard glasses',
      tinyGlasses: 'Reading glasses',
      shades: 'Sunglasses',
      stubble: 'Stubble',
      mediumBeard: 'Medium beard',
      wink: 'Wink',
      shirt: 'Shirt',
      dressShirt: 'Suit',
      dress: 'Dress',
    },
    achievements: {
      notAchievedYet: 'Not achieved yet',
      noAchievements: 'No achievements yet.',
    },
    groupActivity: {
      openGroupActivity: 'Open Group Activity',
      activityNotYetActive:
        'The group activity is not active or not yet unlocked.',
      initialSituation: 'Situation',
      yourHints: 'Your hints',
      coordinateHints:
        'Each group member receives one or more of the hints above.<br></br> Coordinate with each other to collect all the necessary hints for the tasks.',
      yourGroup: 'Your group',
      groupCompleteQuestion:
        'Is your group complete? If so, click Start to distribute the hints among your group members. Members who join the group after the assignment will not receive any additional hints.',
      startCaps: 'START',
      minTwoPersons:
        'Unfortunately, groups with only one member cannot participate in the group quest.<br></br> Find at least one partner to join or check out the task in Excel, which we will publish after the submission deadline.',
      yourTasks: 'Your tasks',
      sendAnswers: 'Submit answers',
      oneSolutionPerGroup:
        'Each group can only submit one solution. Only submit your solutions when you are sure.',
      alreadySubmittedAt:
        'Your group has already submitted its solutions (on {date}).<br></br> The evaluation will be published later and communicated separately.',
      joinLeaderboard:
        'In order to collect points within the scope of the group activity, you must join the course leaderboard. To do this, switch to the other tab and confirm your participation.',
    },
  },
  manage: {
    general: {
      questionPool: 'Question Pool',
      sessions: 'Sessions',
      courses: 'Courses',
      generateToken: 'Generate login token',
      '404Message':
        'The page you requested does not exist. Please return to the <link>question pool</link> or use the main menu at the top for further navigation.',
      date: 'Date',
      title: 'Title',
      searchPlaceholder: 'Search...',
      sortBy: 'Sort by...',
    },
    login: {
      lecturerLogin: 'Login Lecturers',
      installAndroid:
        'Install the KlickerUZH Manage app on your phone to use certain functions for lecturers at any time.',
      installIOS:
        "Open the Share dialog and click 'Add to Home Screen' to install the KlickerUZH Manage app on your phone.",
    },
    token: {
      pageName: 'Token Generation',
      tokenGenerationTitle: 'Generation of a Login Token',
      tokenGenerationExplanation:
        'On this page you can generate a token to log into the Klicker control app at <link>{displayLink}</link>. This token has a validity of 10 minutes, but can be regenerated at any time.',
      generateToken: 'Generate token!',
      tokenTitle: 'Your login token is:',
      remainingValidity: 'Remaining validity:',
      tokenExpired:
        'Unfortunately, your token has expired, please generate a new one.',
    },
    questionPool: {
      createLiveSession: 'Create live session',
      createMicroSession: 'Create micro session',
      createLearningElement: 'Create learning element',
      createGroupTask: 'Create group task',
      createQuestionCaps: 'CREATE QUESTION',
      resetFilters: 'Reset filters',
      showArchived: 'Show archived',
      hideArchived: 'Hide archived',
      questionTypes: 'Question types',
      tags: 'Tags',
      noTagsAvailable: 'No tags available',
      answerFeedbacks: 'Answer feedbacks',
      noQuestionsWarning:
        'We could not find any questions that meet the desired criteria. Please try other filters or create a new question.',
      deleteQuestion: 'Delete question',
      confirmDeletion:
        'Are you sure you want to delete the following question(s)?',
      noQuestionRecovery:
        'This action cannot be undone. The question(s) will be permanently deleted and cannot be restored. Questions will not be removed from existing sessions.',
      numSelected: '{count} selected',
      moveToArchive: 'Move to archive',
      restoreFromArchive: 'Restore from archive',
    },
    tags: {
      deleteTag: 'Delete tag',
      confirmTagDeletion: 'Are you sure you want to delete the following tag?',
      tagDeletionHint:
        'Deleted tags cannot be restored. All questions with this tag will remain, but the tag will be removed.',
      validName: 'Please enter a valid name for your tag.',
    },
    questionForms: {
      CREATETitle: 'Create question',
      EDITTitle: 'Edit question',
      DUPLICATETitle: 'Duplicate question',
      questionType: 'Question type',
      selectQuestionType: 'Select question type',
      questionTitle: 'Question title',
      titleTooltip:
        'Enter a short, summary title for the question. This is only used for better overview.',
      tagsTooltip:
        'Add tags to your question to improve organization and reusability (similar to previous folders).',
      tagFormatting:
        'Temporarily required formatting: Enter tags separated by commas, e.g.: Tag1,Tag2,Tag3',
      multiplierTooltip:
        'Select a multiplier with which the points for this question should be multiplied. It can be chosen between 1 and 4.',
      questionTooltip:
        'Enter the question you want to ask the participants. The rich text editor allows you to use the following (block) formatting: bold text, italic text, code, quotes, numbered lists, unordered lists and LaTeX formulas. Hover over the individual buttons for more information.',
      questionPlaceholder: 'Enter your question here...',
      explanationTooltip:
        'Enter a generic explanation of your question here, which will be displayed to students in learning elements and micro-sessions regardless of their answer as an explanation of the correct solution.',
      explanationPlaceholder: 'Enter your explanation here...',
      attachments: 'Attachments',
      answerOptions: 'Answer options',
      answerOption: 'Answer option',
      answerOptionsTooltip:
        'Enter the possible answers that students can select for the question here.',
      answerOptionPlaceholder: 'Enter your answer option here...',
      FTOptionsTooltip:
        'Enter optional settings for the free text question here.',
      LISTDisplay: 'Display as list',
      GRIDDisplay: 'Display as grid',
      feedbackPlaceholder: 'Enter feedback…',
      addAnswer: 'Add new answer',
      solutionRanges: 'Solution ranges',
      solutionRangesTooltip:
        'Enter the intervals that should be considered correct here.',
      addSolutionRange: 'Add new solution range',
      maximumLength: 'Maximum length',
      answerLength: 'Answer length',
      possibleSolutionN: 'Possible solution {number}',
      possibleSolutions: 'Possible solutions',
      addSolution: 'Add new solution',
      noFeedbackDefined: 'No feedback defined',
      createElement: 'Create {element}',
      editElement: 'Edit {element}',
      cancelCreation: 'Cancel creation',
      cancelEditing: 'Cancel editing',
    },
    sessionForms: {
      sessionName: 'Please enter a name for your session.',
      sessionDisplayName: 'Please enter a valid display name for your session.',
      considerFormErrors: 'Please check the form for error messages.',
      startDate: 'Please enter a start date for your session.',
      endDate: 'Please enter an end date for your session.',
      endAfterStart: 'The end date has to be later than the start date.',
      validMultiplicator: 'Please enter a valid multiplicator.',
      checkValues:
        'Please check your entries in the previous step before proceeding.',
      name: 'Name',
      displayName: 'Display Name',
      multiplierDefault: 'Default: 1x',
      multiplier1: 'Simple (1x)',
      multiplier2: 'Double (2x)',
      multiplier3: 'Triple (3x)',
      multiplier4: 'Quadruple (4x)',
      changesSaved: 'Changes saved',
      elementCreated: 'Element has been created successfully',
      openOverview: 'Open overview',
      createNewElement: 'Create another element',
      enterContentHere: 'Enter your content here...',
      questionsDragDrop: 'Use drag and drop to add your questions here...',
      newQuestion: 'New question',
      timeLimit: 'Time limit',
      optionalTimeLimit: 'Optional time limit',
      timeLimitTooltip: 'Time limit for block ${blockIx} in seconds',
      newBlock: 'New block',
      newBlockSelected: 'Add 1 block with {count} questions',
      pasteSelection: 'Add {count} questions',
      pasteSingleQuestions: 'Add {count} blocks with 1 question',
      displayNameTooltip:
        'Der Anzeigename wird den Teilnehmenden bei der Durchführung angezeigt.',
      microSessionTypes:
        'Micro-sessions can only contain single choice, multiple choice, kprim and numerical questions.',
      microSessionCreated:
        'Your micro-session <b>{name}</b> has been created successfully.',
      microSessionEdited:
        'Your micro-session <b>{name}</b> has been edited successfully.',
      microSessionDescription:
        'In this step, enter the name and description of the micro-session.',
      microSessionSettings:
        'In this step, select the start and end date and make further settings.',
      microSessionQuestions:
        'In this step, select the questions for the micro-session.',
      microSessionEditingFailed: 'Editing the Micro session failed...',
      microSessionCreationFailed: 'Creating the Micro session failed...',
      microSessionName:
        'This name should allow you to distinguish this micro session from others. It will not be shown to the participants, please use the display name (next field) for this.',
      microSessionDescField:
        'Add a description to your micro-session that will be displayed to participants at the beginning.',
      microSessionCourse:
        'For the creation of a micro session, the selection of the corresponding course is required.',
      microSessionStartDate:
        'Please choose the start date of the micro session. The session will be displayed to the participants from this point in time.',
      microSessionEndDate:
        'Please choose the end date of the micro session. The session will no longer be displayed to the participants after this point in time.',
      microSessionMultiplier:
        'The multiplier is a factor with which the points of the participants are multiplied in a gamified micro session.',
      liveSessionGamified: 'Please specify, if the session should be gamified',
      liveSessionTypes:
        'Live sessions can only contain single choice, multiple choice, numerical and free text questions.',
      liveSessionTimeRestriction: 'Please enter a valid time restriction.',
      liveSessionCreated: 'Live session <b>{name}</b> successfully created.',
      liveSessionUpdated: 'Live session <b>{name}</b> successfully updated.',
      liveSessionDescription:
        'In this step, enter the name and description of the live session.',
      liveSessionSettings:
        'In this step, you can make settings for the session.',
      liveSessionBlocks: 'Questions & Blocks',
      liveSessionDragDrop:
        'Use drag&drop on the plus icon to add questions to your blocks. New blocks can be created either by drag&drop on the corresponding field or by clicking on the button.',
      liveSessionCreationFailed: 'Creating the live session failed...',
      liveSessionEditingFailed: 'Editing the live session failed...',
      liveSessionName:
        'The name should allow you to distinguish this session from others. It will not be shown to the participants, please use the display name (next field) for this.',
      liveSessionDescField:
        'Here you can enter an optional description of the live session. This will be displayed to the students at the beginning of the session.',
      liveSessionCourse: 'You can assign your session to a course.',
      liveSessionSelectCourse: 'Select course',
      liveSessionNoCourse: 'No course',
      liveSessionMultiplier:
        'The multiplier is a factor with which the points are multiplied when a question is answered. The factor is only used if gamification is activated.',
      liveSessionGamification:
        'Specify whether gamification should be enabled for this session. Gamified sessions should only be used for gamified courses.',
      learningElementResetDays:
        'Please enter a number of days after which the learning element can be repeated.',
      learningElementValidResetDays:
        'Please enter a valid number of days after which the learning element can be repeated.',
      learningElementTypes:
        'Learning elements can only contain single choice, multiple choice, Kprim and numerical questions.',
      learningElementSolutionReq: 'Please only add questions with solution.',
      learningElementCreated:
        'Learning element <b>{name}</b> successfully created.',
      learningElementUpdated:
        'Learning element <b>{name}</b> successfully modified.',
      learningElementDescription:
        'In this step, enter the name and description of the learning element.',
      learningElementSettings:
        'In this step, make settings for your learning element.',
      learningElementContent:
        'In this step, add questions and text elements to your learning element.',
      learningElementCreationFailed: 'Creating the learning element failed...',
      learningElementEditingFailed: 'Editing the learning element failed...',
      learningElementName:
        'The name should allow you to distinguish this learning element from others. It will not be shown to the participants, please use the display name (next field) for this.',
      learningElementDescField:
        'Add a description to your learning element that will be displayed to participants at the beginning.',
      learningElementSelectCourse:
        'For the creation of a learning element, the selection of the corresponding course is required.',
      learningElementMultiplier:
        'Select a multiplier. All points that students collect in this learning element will be multiplied by the multiplier.',
      learningElementRepetition:
        'Select a period after which students can repeat the learning element.',
      learningElementOrder:
        'Select an order in which the questions are to be solved by the students.',
      learningElemenSelectOrder: 'Select order',
      learningElementSEQUENTIAL: 'Sequential',
      learningElementSHUFFLED: 'Shuffeld',
      learningElementLAST_RESPONSE: 'Last response first',
    },
    formErrors: {
      resolveErrors:
        'Please ensure that the following errors in the form are resolved before saving the question:',
      questionName: 'Please enter a name for the question.',
      questionContent: 'Please add some content to your question.',
      attachmentURL: 'Please enter a valid URL for the attachment.',
      attachmentName: 'Please enter a name for the attachment.',
      answerContent: 'Please add some content to your answer option.',
      feedbackContent: 'Please add some content to your answer feedback.',
      SCAnswersCorrect:
        'For SC questions exactly one answer has to be marked as correct.',
      MCAnswersCorrect:
        'For MC questions at least one answer has to be marked as correct.',
      enterSolution: 'Please enter a solution.',
      FTMaxLength:
        'The maximum length of a free text question response has to be at least 1.',
      solutionRequired:
        'Please enter at least one solution of deactivate the sample solution.',
      NRPrecision: 'The number of decimal places must be at least 0.',
      solutionRangeRequired: 'Please enter at least one valid solution range.',
    },
    sessions: {
      runningSessions: 'Running Sessions',
      plannedSessions: 'Planned Sessions',
      preparedSessions: 'Prepared Sessions',
      completedSessions: 'Completed Sessions',
      embeddingEvaluation: 'Embed Evaluation',
      lecturerCockpit: 'Lecturer Cockpit',
      sessionEvaluation: 'Session Evaluation',
      startSession: 'Start Session',
      editSession: 'Edit Session',
      deleteSession: 'Delete Session',
      nBlocksQuestions: '{blocks} blocks, {questions} questions',
      blockXQuestions: 'Block {block} ({questions} question(s))',
      deleteLiveSession: 'Delete Live Session',
      confirmLiveSessionDeletion:
        'Are you sure you want to delete the following live session?',
      liveSessionDeletionHint:
        'Deleting a live session is only possible as long as it has not been started. Deleted live sessions cannot be restored at a later date.',
      evaluationLinksEmbedding: 'Evaluation links for embedding in PowerPoint',
      noSessions: 'No sessions available',
      creationExplanation:
        'To create your first session, go back to the <link>question pool</link>. There you can create all different types of KlickerUZH elements and add questions from the question pool.',
    },
    cockpit: {
      firstBlock: 'Start first block',
      blockActive: 'Close block',
      nextBlock: 'Start next block',
      endSession: 'End session',
      audienceView: 'Audience view',
      evaluationResults: 'Evaluation (results)',
      abortSession: 'Abort session',
      confirmAbortSession:
        'Are you sure you want to abort the following session?',
      abortSessionHint:
        'When aborting a session, the session is reset so that it can be started again from the beginning at a later date. Please note that all previous answers, feedbacks, etc. will be lost.',
      blockN: 'Block {number}',
      qrCode: 'QR Code',
      presentQrCode: 'Present QR code',
      printTitle: 'Session "{name}" - Feedback Channel',
      lecturerView: 'Lecturer View',
      liveQA: 'Live Q&A',
      activateQA: 'Activate Live Q&A',
      activateModeration: 'Activate Moderation',
      QaNotActive: 'Live Q&A not active.',
      activateFeedback: 'Activate Feedback',
      feedbackNotActive: 'Feedback not active.',
      noFeedbacksYet: 'No feedbacks received yet...',
      noFeedbackFilterMatch:
        'No feedbacks match the current filter settings...',
      filterSolved: 'Resolved',
      filterOpen: 'Open',
      filterUnpinned: 'Unpinned',
      filterUnpublished: 'Unpublished',
      sortByVotes: 'Sort by votes',
      sortByTime: 'Sort by time',
      answersGiven: '{number} answer(s) given',
      reopenToAnswer: 'Reopen feedback to answer...',
      insertResponseHere: 'Insert your response here...',
      pinFeedback: 'Pin',
      unpinFeedback: 'Unpin',
      reopen: 'Reopen',
      resolve: 'Resolve',
      noDataYet: 'No data available yet.',
      confusionSlow: 'slow',
      confusionOptimal: 'optimal',
      confusionFast: 'fast',
      confusionEasy: 'easy',
      confusionDifficult: 'difficult',
      speed: 'Speed',
      difficulty: 'Difficulty',
      confusionSpeedTooltip:
        'The display below illustrates the aggregated feedback of the students regarding the currently perceived speed of the lecture.',
      confusionDifficultyTooltip:
        'The display below illustrates the aggregated feedback of the students regarding the currently perceived difficulty of the content being taught.',
    },
    evaluation: {
      evaluationNotYetAvailable:
        'The evaluation for this question cannot be displayed yet. If you want to embed this page somewhere, e.g. via the PowerPoint plugin, the evaluation will be displayed automatically after starting the question.',
      noSignedInStudents:
        'So far, no participants were signed in during this session and collected points.',
      noFeedbacksYet: 'This session does not contain any feedbacks yet.',
      noConfusionFeedbacksYet:
        'This session does not contain any confusion feedbacks yet.',
      totalParticipants: 'Total participants: {number}',
      showSolution: 'Show solution',
      fontSize: 'Font size',
      validSolutionRange: 'Valid solution range',
      correctSolutionRanges: 'Correct solution ranges',
      statistics: 'Statistics',
      keywordsSolution: 'Solution keywords',
      noChartsAvailable: 'There exists no chart for this question type yet',
      count: 'Count',
      value: 'Value',
      histogramRange: 'Range',
      histogramBins: 'Bins',
      resetSorting: 'Reset sorting',
      noFeedbacksMatchFilter:
        'No feedbacks match the current filter settings...',
      resolvedDuringSession: 'Resolved during session',
      confusionTitle: 'Confusion',
      minStep60s: 'The step size must be at least 60 seconds.',
      validMinSteps: 'Please enter a valid minimum step size.',
      minWindowLength: 'The window length must be at least 1.',
      validWindowLength: 'Please enter a valid window length.',
      confusionDiagramsTooltip:
        'The diagrams below show all confusion feedbacks of the participants from the beginning to the end of the Klicker session. The values are normalized to the interval [-1,1] and set to 0 if no values are available in a time interval. The exact number of feedbacks can be read out by hovering the mouse over a data point.',
      avgDifficulty: 'Avg. Difficulty',
      avgSpeed: 'Avg. Speed',
      graphSettings: 'Graph settings',
      timestepX: 'Timesteps X-Axis',
      timestepXTooltip:
        'In this field, the step size on the x-axis in seconds for the diagrams can be entered. The minimum value is 60 seconds, the default value is 120 seconds.',
      minTimestep: 'min. 60s',
      windowLength: 'Window length',
      windowLengthTooltip:
        'In this field, a custom factor (multiplied by the step size on the x-axis) for the size of the running window for the average calculation can be set. The smallest possible factor is 1, the default value is 3.',
      minWindow: 'min. 1',
      displayedInterval: 'Displayed interval: {interval} seconds',
      displayedWindow: 'Displayed running window: {window} times interval',
      table: 'Table',
      wordCloud: 'Word Cloud',
      histogram: 'Histogram',
      barChart: 'Bar Chart',
    },
    lecturer: {
      noDataAvailable: 'No data available...',
      audienceInteractionNotActivated:
        'Audience interaction has not been activated.',
      noFeedbacks: 'No feedbacks received or pinned yet...',
    },
    courseList: {
      selectCourse: 'Please select a course',
      createNewCourse: 'Create new course',
      noCoursesFound: 'No courses found.',
      createCourseNow: 'Create a course now!',
      courseNameReq: 'Please enter a name for the course.',
      courseDisplayNameReq: 'Please enter a display name for the course.',
      courseColorReq: 'Please select a color for the course.',
      courseStartReq:
        'Please enter a start date for your course. The dates can be changed after creating the course.',
      courseEndReq:
        'Please enter an end date for your course. The dates can be changed after creating the course.',
      endDateFuture: 'The end date must be in the future.',
      endAfterStart: 'The end date must be after the start date.',
      courseName: 'Course name',
      courseNameTooltip:
        'The course name is used for identification purposes. Students will not see this name.',
      courseDisplayName: 'Course display name',
      courseDisplayNameTooltip:
        'The display name is shown to students. It can differ from the course name.',
      courseDescriptionTooltip:
        'The description is shown to students. You can use it to describe the goals of the course.',
      addDescription: 'Add description',
      startDate: 'Start date',
      startDateTooltip:
        "After the start date, students can access the course's content. The start date can be changed after creating the course.",
      endDate: 'End date',
      endDateTooltip:
        'After the end date, the course will be shown as archived to students, but they can still access the content. The end date can be changed after creating the course.',
      courseColor: 'Course color',
      courseCreationFailed: 'Failed to create course...',
    },
    course: {
      nameWithPin: 'Course: {name} (PIN: {pin})',
      joinCourse: 'Join course',
      requiredPin: 'The PIN required to join is: <b>{pin}</b>',
      nParticipants: '{number} participants',
      saveDescription: 'Save description',
      changedDate: 'Date has been successfully adjusted.',
      dateChangeFailed:
        'An error occurred while adjusting the date. Please check the input.',
      noSessions: 'No sessions available',
      noLearningElements: 'No learning elements available',
      noMicroSessions: 'No micro-sessions available',
      courseLeaderboard: 'Course Leaderboard',
      participantsLeaderboard: 'Participants Leaderboard: {number}',
      avgPoints: 'Average points: {points}',
      runningSession: 'Running session',
      publicAccess: 'Public access',
      restrictedAccess: 'Restricted access',
      startAt: 'Start: {time}',
      endAt: 'End: {time}',
      nQuestions: '{number} questions',
      copyAccessLink: 'Copy access link',
      linkMicroSessionCopied:
        'The link to the micro-session has been successfully copied to the clipboard.',
      linkLearningElementCopied:
        'The link to the learning element has been successfully copied to the clipboard.',
      editMicroSession: 'Edit micro-session',
      publishMicroSession: 'Publish micro-session',
      deleteMicroSession: 'Delete micro-session',
      publishItem: 'Publish {name}',
      confirmPublishing: 'Are you sure you want to publish the following item?',
      publishingHint:
        'Publishing a learning element or micro-session makes the item visible to all participants. This process cannot be undone. Changes to the content of an item cannot be made after publishing.',
      microPublishingHint:
        'Micro-sessions are additionally only visible within the specified date range.',
      confirmDeletionMicroSession:
        'Are you sure you want to delete the following micro-session?',
      hintDeletionMicroSession:
        'Deleting a micro-session is only possible as long as it is not running and is used in a course. Deleted micro-sessions cannot be restored at a later date.',
      editLearningElement: 'Edit learning element',
      publishLearningElement: 'Publish learning element',
      deleteLearningElement: 'Delete learning element',
      confirmDeletionLearningElement:
        'Are you sure you want to delete the following learning element?',
      hintDeletionLearningElement:
        'Deleting a learning element is only possible as long as it is not used in an active course. Deleted learning elements cannot be restored at a later date.',
    },
    toasts: {
      learningElementEdit: 'Learning element successfully edited!',
      learningElementCreate: 'Learning element successfully created!',
      toCourseOverview: 'To <link>course overview</link>',
      liveSessionEdit: 'Session successfully edited!',
      liveSessionCreate: 'Session successfully created!',
      toSessionList: 'To <link>session list</link>',
      microSessionEdit: 'Micro-session successfully edited!',
      microSessionCreate: 'Micro-session successfully created!',
    },
  },
  control: {
    login: {
      header: 'KlickerUZH Controller-App (Token)',
      installAndroid:
        'Install the KlickerUZH Controller app on your phone to control your sessions directly from your smartphone during lectures.',
      installIOS:
        "Open the share dialog and click 'Add to Home Screen' to install the KlickerUZH Controller app on your phone and control live sessions directly.",
    },
    home: {
      courseSelection: 'Course Selection',
      errorLoadingCourse:
        'An error occurred while loading your courses. Please try again later.',
      selectCourse: 'Please select a course:',
      archivedCourse: '{courseName} (archived)',
      sessionsNoCourse: 'Sessions without course',
      listSessionsNoCourse: 'List of all sessions without course',
    },
    course: {
      courseOverview: 'Course overview',
      loadingFailed:
        'An error occurred while loading your courses. Please try again later.',
      completedSessionsHint:
        'Completed sessions can be viewed with results on the corresponding page in the KlickerUZH management app.',
      runningSessions: 'Running Sessions',
      noRunningSessions: 'No running sessions',
      plannedSessions: 'Planned Sessions',
      noPlannedSessions: 'No planned sessions',
      sessionStartFailed:
        'Unfortunately, your session could not be started due to an error. Please try again later.',
      pptEmbedding: 'PPT-Embedding Evaluation',
      startSession: 'Start session',
      confirmStartSession:
        'Are you sure you want to start the following session?',
      explanationStartSession:
        'Please note that a started live session is generally publicly accessible. Running sessions can be canceled or stopped using the KlickerUZH management app.',
    },
    session: {
      sessionControl: 'Session Control',
      errorLoadingSession:
        'Unfortunately, an error occurred while loading the session. Please make sure that the session is still running or try again later.',
      containsNoQuestions:
        'This session does not contain any questions and therefore cannot be controlled via the controller app at the moment. Please use the management app with all functionalities.',
      sessionWithName: 'Session: {name}',
      activeBlock: 'Active Block:',
      closeBlock: 'Close Block',
      nextBlock: 'Next Block:',
      activateBlockN: 'Activate Block {number}',
      hintAllBlocksClosed:
        'All blocks of this session have already been executed and closed. The feedback channel will be closed when the session is ended.',
      endSession: 'End Session',
      hintLastBlock:
        'The currently running block is the last of this session. After closing it, the session can be ended.',
      blockN: 'Block {number}',
    },
  },
}
