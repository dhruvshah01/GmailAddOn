var TRELLO_API_KEY = ScriptProperties.getProperty('key');
var TRELLO_API_TOKEN = ScriptProperties.getProperty('token');
var TRELLO_BOARD_ID = "64935f3b608403348f2ffd4f";

function gmailUI(){
  var lists = retrieveTrelloLists();

  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Trello Board Information'));

   for (var i = 0; i < lists.length; i++) {
    var list = lists[i];
    var listName = list.name || 'No Name';
    var section = CardService.newCardSection()
      .setHeader('<b>' + listName + '</b>')
      .addWidget(CardService.newTextButton().setText('View Cards').setOnClickAction(CardService.newAction().setFunctionName('handleListClick').setMethodName('handleListClick').setParameters({ listId: list.id })));

    // for (var j = 0; j < cards.length; j++) {
    //   var cardName = cards[j].name || 'No Name';
    //   section.addWidget(CardService.newTextParagraph().setText(cardName));
    // }
    card.addSection(section);
  }

   var createListButton = CardService.newTextButton()
    .setText('Create New List')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('createNewList'));
  var createListSection = CardService.newCardSection().addWidget(createListButton);
  card.addSection(createListSection);

  var cardBuilder = card.build();
  return cardBuilder;

}

function handleListClick(e){
  var listId = e.parameters.listId;
  var cards = retrieveTrelloCards(listId);

  var card = CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle("<b>Cards for the List</b>"));
  var section = CardService.newCardSection();
  if (cards.length === 0) {
    section.addWidget(CardService.newTextParagraph().setText('No cards found for the list.'));
  } else {
    for (var i = 0; i < cards.length; i++) {
      var cardName = cards[i].name || 'No Name';
      var cardDescription = cards[i].description || 'No Description';
      var cardId = cards[i].id || '';

      var cardText = '<b>' + cardName + '</b>\n' + cardDescription;
      section.addWidget(CardService.newTextParagraph().setText(cardText));

      var cardButton = CardService.newTextButton()
        .setText('Add Email to the Card')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('handleCardClick')
          .setParameters({ cardId: cardId }));
      section.addWidget(cardButton);
    }
  }

  var createCardButton = CardService.newTextButton()
    .setText('Create Card')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('handleCreateCardClick')
      .setParameters({ listId: listId }));
  section.addWidget(createCardButton);

  card.addSection(section);
  var cardBuilder = card.build();
  return cardBuilder;

}


function retrieveTrelloLists(){
  var url = 'https://api.trello.com/1/boards/' + TRELLO_BOARD_ID + '/lists?key=' + TRELLO_API_KEY + '&token=' + TRELLO_API_TOKEN;
  
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());

  var lists = [];
  for (var i = 0; i < data.length; i++){
      var list = {
        id: data[i].id,
        name: data[i].name
      };
      lists.push(list);
  }

  return lists;
}

function retrieveTrelloCards(listId){
  var url = 'https://api.trello.com/1/lists/' + listId + '/cards?key=' + TRELLO_API_KEY + '&token=' + TRELLO_API_TOKEN;
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());

  var cards = [];
  for (var i = 0; i < data.length; i++){
    card = {
      id: data[i].id,
      name: data[i].name,
      description: data[i].desc
    };
    cards.push(card);
  }

  return cards;
}

function handleButtonClick(e) {
  var identifier = e.parameters.identifier;
  console.log('Button clicked for identifier:', identifier);
}

function retrieveTrelloInformation(){
  var url = "https://api.trello.com/1/boards/" + TRELLO_BOARD_ID + "/cards?key=" + TRELLO_API_KEY + "&token=" + TRELLO_API_TOKEN;
  var response = UrlFetchApp.fetch(url);
  var data = JSON.parse(response.getContentText());

  var content = [];
  for (var i = 0; i < data.length; i++){
    var card = {
      name: data[i].name,
      desc: data[i].desc
    };
    content.push(card);
  }
  //console.log(content);
  return content;
}

function createNewList(e) {
  var card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Create New List'));

  var section = CardService.newCardSection();

  var textInput = CardService.newTextInput()
    .setTitle('Enter List Name')
    .setFieldName('listName')
    .setHint('List Name');
  section.addWidget(textInput);

  var createButton = CardService.newTextButton()
    .setText('Create List')
    .setOnClickAction(CardService.newAction()
      .setFunctionName('handleCreateListClick'));
  section.addWidget(createButton);

  card.addSection(section);

  var cardBuilder = card.build();
  return cardBuilder;
}

function handleCreateListClick(e) {
  var listName = e.formInput.listName;

  if (listName) {
    createTrelloList(listName); // Function to create a new list in Trello
  }

  // Return the main UI after creating the list
  return gmailUI();
}

function createTrelloList(listName) {
  var url = "https://api.trello.com/1/lists";
  var payload = {
    key: TRELLO_API_KEY,
    token: TRELLO_API_TOKEN,
    name: listName,
    idBoard: TRELLO_BOARD_ID
  };
  var options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());

  // Handle the response or perform additional actions as needed
  if (response.getResponseCode() === 200) {
    // List created successfully
    console.log("List created: " + data.name);
  } else {
    // Error creating the list
    console.error("Error creating list: " + data.error);
  }
}

function createTrelloCard(listId, cardName, cardDescription) {
  var url = "https://api.trello.com/1/cards";
  var payload = {
    key: TRELLO_API_KEY,
    token: TRELLO_API_TOKEN,
    idList: listId,
    name: cardName,
    desc: cardDescription
  };
  var options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());

  // Handle the response or perform additional actions as needed
  if (response.getResponseCode() === 200) {
    // Card created successfully
    console.log("Card created: " + data.name);
  } else {
    // Error creating the card
    console.error("Error creating card: " + data.error);
  }
}

function handleCreateCardClick(e) {
  var listId = e.parameters.listId;
  
  var cardNamePrompt = CardService.newTextInput()
    .setFieldName('cardName')
    .setTitle('Card Name')
    .setHint('Enter the name of the card')
    .setMultiline(false);
  
  var cardDescriptionPrompt = CardService.newTextInput()
    .setFieldName('cardDescription')
    .setTitle('Card Description')
    .setHint('Enter the description of the card')
    .setMultiline(true);
  
  var createCardAction = CardService.newAction()
    .setFunctionName('createNewCard')
    .setParameters({ listId: listId });
  
  var cardBuilder = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Create New Card'))
    .addSection(CardService.newCardSection()
      .addWidget(cardNamePrompt)
      .addWidget(cardDescriptionPrompt)
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Create')
          .setOnClickAction(createCardAction))))
    .build();
  
  return cardBuilder;
}

function createNewCard(e) {
  var listId = e.parameters.listId;
  var cardName = e.formInput.cardName;
  var cardDescription = e.formInput.cardDescription;

  createTrelloCard(listId, cardName, cardDescription);
  var confirmationText = 'New card created successfully!';
  
  var redirectToCardsListAction = CardService.newAction()
    .setFunctionName('handleListClick')
    .setParameters({ listId: listId });
  
  var cardBuilder = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('New Card Created'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText(confirmationText))
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Back to Cards List')
          .setOnClickAction(redirectToCardsListAction))))
    .build();

  return cardBuilder;
}

function handleCardClick(e) {
  var cardId = e.parameters.cardId;
   var messageId = e.gmail.messageId;
//   var message = GmailApp.getMessageById(messageId);
//   var subject = message.getSubject();
//   var sender = message.getFrom();
//   var messageDate = message.getDate();

  // Access the email information using the provided event object
  //var messageId = e.messageMetadata.messageId;
  // var email = GmailApp.getMessageById(messageId);
  
  // var emailSubject = email.getSubject();
  // var emailFrom = email.getFrom();
  // var emailDate = email.getDate();

  //var messageId = e.messageMetadata.messageId;
  var email = GmailApp.getMessageById(messageId);
  
  var emailSubject = email.getSubject();
  var emailFrom = email.getFrom();
  var emailDate = email.getDate();
  
  // Create the checklist item description using the email information
  var checklistItemDescription = "Email Information:\n\n" +
    "Subject: " + emailSubject + "\n" +
    "From: " + emailFrom + "\n" +
    "Date: " + emailDate;
  
  // Add the checklist item to the card
  var checklistItem = createChecklistItem(cardId, checklistItemDescription);
  
  // Optionally, you can display a confirmation message to the user
  var confirmationText = 'Email added to the card successfully!';
  
  var cardBuilder = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle('Email Added to Card'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph().setText(confirmationText)))
    .build();
  
  return cardBuilder;

  
  return cardBuilder;
}


function createChecklistItem(cardId, description) {
  var url = "https://api.trello.com/1/cards/" + cardId + "/checklists";
  var payload = {
    key: TRELLO_API_KEY,
    token: TRELLO_API_TOKEN,
    name: "Email Information",
    idCard: cardId,
    desc: description
  };
  
  var options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  
  var response = UrlFetchApp.fetch(url, options);
  var data = JSON.parse(response.getContentText());
  
  var checklistId = data.id;
  
  // Add the checklist item to the checklist
  addChecklistItem(checklistId, description);
}

function addChecklistItem(checklistId, description) {
  var url = "https://api.trello.com/1/checklists/" + checklistId + "/checkItems";
  var payload = {
    key: TRELLO_API_KEY,
    token: TRELLO_API_TOKEN,
    name: "Email Details",
    checked: false,
    pos: "bottom",
    desc: description
  };
  
  var options = {
    method: "POST",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  };
  
  UrlFetchApp.fetch(url, options);
}


// function gmailUI(){
//   var cardContent = retrieveTrelloInformation();

//    var card = CardService.newCardBuilder()
//     .setHeader(CardService.newCardHeader().setTitle('Trello Card Information'))
//     .addSection(
//       CardService.newCardSection().addWidget(
//         CardService.newTextParagraph().setText('<b>Trello Card Information</b>')
//       )
//     );

//   for (var i = 0; i < cardContent.length; i++) {
//     var cardName = cardContent[i].name || "No Name";
//     var cardDescription = cardContent[i].desc || '';

//     var section = CardService.newCardSection()
//       .setHeader('<b>' + cardName + '</b>')
//       .addWidget(CardService.newTextParagraph().setText(cardDescription))
//       .addWidget(CardService.newTextButton().setText('Button').setOnClickAction(CardService.newAction().setFunctionName('handleButtonClick').setMethodName('handleButtonClick').setParameters({ identifier: i.toString() })));
      
//     card.addSection(section);
//   }
//   //var cardAction = CardService.newCardAction().setText('Close');
  

//   //card.addCardAction(cardAction);
  
//   var cardBuilder = card.build();
//   return cardBuilder;
//   // var card = CardService.newCardBuilder();
//   // var section = CardService.newCardSection();
//   // section.addWidget(CardService.newTextParagraph().setText(content));
//   // card.addSection(section);

//   // return card.build();
// }


// https://trello.com/1/authorize?key=8498396f15c571cc212800a781ab4f7d&name=MyApp&expiration=never&response_type=token&scope=read,write



// function addCardToTrello() {
//   var composeAddOn = CardService.newComposeActionResponseBuilder();
//   var emailId = Session.getActiveUser().getEmail();
//   var subject = "Example Test Subject";
//   var date = new Date().toLocaleDateString();

//   var cardUrl = createTrelloCard(subject, emailId, date);
  
//   var headerSection = CardService.newCardSection()
//     .addWidget(CardService.newTextParagraph().setText("Email ID: " + emailId))
//     .addWidget(CardService.newTextParagraph().setText("Subject: " + subject))
//     .addWidget(CardService.newTextParagraph().setText("Date: " + date))
//     .addWidget(CardService.newTextParagraph().setText("Trello Card URL: " + cardUrl));
  
//   var card = CardService.newCardBuilder()
//     .setHeader(CardService.newCardHeader().setTitle("Email Details"))
//     .addSection(headerSection)
//     .build();

//   var navigation = CardService.newNavigation().pushCard(card);
//   var actionResponse = CardService.newActionResponseBuilder().setNavigation(navigation).build();

//   return actionResponse;
// }

//function buildAddOn(e) {
  //var composeTrigger = e.gmail && e.gmail.composeTrigger;

  // if (composeTrigger) {
  //   var cardTitle = e.gmail.draftMetadata.subject;
  //   var cardDate = e.gmail.draftMetadata.date.toLocaleDateString();
  //   var recipients = e.gmail.draftMetadata.toRecipients.map(function(recipient) {
  //     return recipient.emailAddress;
  //   }).join(", ");
  //   createTrelloCard(cardTitle, recipients, cardDate);

  //   var composeResponse = CardService.newComposeActionResponseBuilder()
  //     .setNotification(CardService.newNotification().setText("Trello card created successfully."))
  //     .build();

  //   return composeResponse;
  // }

//   var accessToken = e.gmail.AccessToken;
//   GmailApp.setCurrentMessageAccessToken(accessToken);
//   var messageId = e.gmail.messageId;
//   var message = GmailApp.getMessageById(messageId);
//   var subject = message.getSubject();
//   var sender = message.getFrom();
//   var messageDate = message.getDate();
  
//   var card = createTrelloCard(subject, sender, messageDate);  
  
//   var actionResponseBuilder = CardService.newActionResponseBuilder()
//     .setNotification(CardService.newNotification()
//       .setType(CardService.NotificationType.INFO)
//       .setText("A new Trello card has been created.")
//     );
//   var cardText = "Card Name: " + card.name + "\nDescription: " + card.desc;

//   var section = CardService.newCardSection()
//     .setHeader("Trello Card")
//     .addWidget(CardService.newTextParagraph().setText(cardText));

//   var card = CardService.newCardBuilder()
//     .addSection(section)
//     .build();

  

//   return actionResponseBuilder.build();
// }

// function createTrelloCard(subject, from, date) {
//   var url = "https://api.trello.com/1/cards";
//   var payload = {
//     key: TRELLO_API_KEY,
//     token: TRELLO_API_TOKEN,
//     idList: TRELLO_LIST_ID,
//     name: subject,
//     desc: "From: " + from + "\nDate: " + date,
//     idList: TRELLO_LIST_ID,
//     idBoard: TRELLO_BOARD_ID
//   };
  
//   var options = {
//     method: "post",
//     contentType: "application/json",
//     payload: JSON.stringify(payload)
//   };
  
//   var response = UrlFetchApp.fetch(url, options);
//   var card = JSON.parse(response.getContentText());
  
//   return card;
// }




