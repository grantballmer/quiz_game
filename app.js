
$(document).ready(function() {

  //variables
  let categories = [11, 14, 12, 23, 24];
  let difficulties = ["easy", "medium", "hard"];
  let category; let difficulty;
  
  let currentTriviaInfo;
  let questions = [];
  let questionsIndex = 0;
  let correctAnswer; 
  let numCorrect = 0;
  
  //hide start button and display settings screen
  $(".start__button").on("click", function() {
		if ($(this).hasClass("restart")){
			resetGame();	
		}
    $(this).hide();
    $(".settings").show().css("display", "grid");
  });
  
  //function to accept category and difficulty clicks
  function settingsHandler(self, selector, arr) {
    selector.not(self).css("opacity", "0");
    let index = selector.index(self);
    //return index value to pass into global variable
    return arr[index]; 
  }
  
  $(".categories").on("click", function() {
    category = settingsHandler($(this), $(".categories"), categories)
    if (difficulty != null) {
      setTimeout(moveToQuestions, 1000);
    }
  });
  
  $(".difficulty").on("click", function() {
    difficulty = settingsHandler($(this), $(".difficulty"), difficulties);
    if (category != null) {
      setTimeout(moveToQuestions, 1000);
    }
  })
  
  function moveToQuestions() {
    $(".nav h2").fadeOut("slow");
    $(".settings").fadeOut("slow");
    apiCall(displayQuestion);
  }

  //generate and store questions
  function apiCall(func){
    let apiUrl = "https://opentdb.com/api.php?amount=15&category=" + category + "&difficulty=" + difficulty;
    $.getJSON(apiUrl, function(data) {
      
      for (let i = 0; i < 15; i++) {
        let dataIncorrect = data.results[i].incorrect_answers;
        let results = data.results[i];
        //create array of question objects
        questions.push({
          question: results.question,
          correct: results.correct_answer,
          incorrect: dataIncorrect
        });
      };
      shuffleArray(questions);
      func();
    });
  };
  
  //returns a random array of numbers 1 to 4
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
  }
  
  function checkforTorF(array) {
    if (array.length === 2) {
      $(".answers__box").slice(2).hide();
    } else {
      $(".answers__box").each(function() {
        $(this).show();
      })
    }
  }
  
  function questionTimer() {
    $(".nav__timer").css("animation", "scrollingTimer 15s .5s linear");
    $(".nav__timer").on("animationend", function() {
      incorrectAnswer();
      setTimeout(nextQuestion, 1500);
    })
  }
  
  function displayQuestion() {
    //Push all answers to array and randomize;
    currentTriviaInfo = questions[questionsIndex];
    correctAnswer = currentTriviaInfo.correct.replace(/&#039;|&quot;|&ldquo;|&rdquo;/ig, "\'");
    let answersArray = [correctAnswer];
    
    for (let property in currentTriviaInfo.incorrect) {
      let incorrect = currentTriviaInfo.incorrect[property].replace(/&#039;|&quot;|&ldquo;|&rdquo;/ig, "\'");
      answersArray.push(incorrect);
    }
    answersArray.map(function(answer) {
      return answer.replace(/&aacute;/ig, "á");;
    });
    shuffleArray(answersArray);
    checkforTorF(answersArray);
    let questionText = currentTriviaInfo.question.replace(/&#039;|&quot;|&ldquo;|&rdquo;/ig, "\'");
    questionText = questionText.replace(/&amp;/ig, "&")

    $(".answers__box").each(function(index) {
      $(this).text(answersArray[index]);
    })
    
    questionTimer();
    
    //Set Question heading
    $(".card__one").text(questionText).css({
      "fontWeight": "300",
      "opacity": "1"
      });
    
    $(".nav h2").text("Question " + (parseInt(questionsIndex) + 1));
    $(".nav h2").fadeIn();
    $(".game").fadeIn();
  }
  
  function nextQuestion() {
    questionsIndex += 1;
    if (questionsIndex === 10) {
      $(".game").fadeOut("slow", function() {
				$(".nav h2").text("Finished");
				$(".finish__correct").text(parseInt((numCorrect / 10) * 100) + "% Correct");
				//$(".restart").show();
				$(".finish").fadeIn("slow");
			})
    } else {
      $(".nav h2").fadeOut("slow");
      $(".game").fadeOut("slow", function() {
        $(".nav h2").text("Question " + questionsIndex + 1);
        $(".answers__box").each(function() {
          $(this).removeClass("correctAnswer wrongAnswer");
        })
        displayQuestion();
      });  
    };
  }
  
  //User clicks an answer
  $(".answers").on("click", ".answers__box", function() {
    $(".nav__timer").css("animation", "");
    if ($(this).text() === correctAnswer) {
      $(this).addClass("correctAnswer");
			showOverlay($(".overlay__correct"), "green");
      numCorrect += 1;
    } else {
      $(this).addClass("wrongAnswer"); 
      incorrectAnswer();
    } 
    setTimeout(nextQuestion, 2500);
  })
  
  //Change correct answer box to green 
  function incorrectAnswer() {
    $(".nav__timer").css("animation", "");
    showOverlay($(".overlay__incorrect"), "red");
    $(".answers__box").each(function(index) {
      if ($(this).text() === correctAnswer) {
        $(this).addClass("correctAnswer");
      }
    })
  }
	
	//display overlay for correct or incorrect
	function showOverlay(overlay, colorVar) {
		overlay.css({
			"border": "3px solid " + colorVar,
			"color": colorVar
		})
		overlay.fadeIn("slow", function() {
			overlay.delay(1000).fadeOut("slow");
		}).css("display", "flex");
	}
	
	$(".restart").on("click", function() {
		
		resetGame();
	});
	
	function resetGame() {
		$(".nav h2").text("Quiz Game");
		$(".finish").hide();
		difficulty = null; category = null;
		$(".categories").each(function() {
			$(this).css("opacity", "1");
		})
		$(".difficulty").each(function() {
			$(this).css("opacity", "1");
		})
		$(".answers__box").each(function() {
			$(this).removeClass("correctAnswer wrongAnswer");
		});
		questionsIndex = 0;
		numCorrect = 0;
		questions = [];
		$(".start__button").show();
	}
	
});
