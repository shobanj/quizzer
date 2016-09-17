var sel_questions = { "questions" : []};
var selected_answers;

var q_index = 0;
var q_max = 0;
var max_correct = 0;

var topics = [];

function split( val ) {
    return val.split( /,\s*/ );
}

function extractLast( term ) {
    return split( term ).pop();
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function update_topics() {
    topics = [];

    for(var i in data.questions) {
	var tags = data.questions[i].cat.split("/");

	for(var j in tags) {
	    if(topics.indexOf(tags[j]) == -1)
		topics.push(tags[j]);
	}
	
	if(topics.indexOf(data.questions[i].cat) == -1)
	    topics.push(data.questions[i].cat);
    }

    topics.sort();
}

function get_num_questions(tags) {
    var cats = tags.split(", ");
    var c = 0;

    for(var i in data.questions) {
	for(var j in cats) {
	    if(cats[j] == "")
		continue;
	    
	    if(data.questions[i].cat.indexOf(cats[j].trim()) !== -1) {
		c++;
		break;
	    }
	}
    }    
    
    return c;
}

function initialize() {
    prep_sel_questions();

    sel_questions.questions = shuffle(sel_questions.questions);
    
    var to_erase = Object.keys(sel_questions.questions).length - $( "#sl_numquestions" ).slider("value");
    sel_questions.questions.splice(0, to_erase);
    
    q_index = 0;

    q_max = Object.keys(sel_questions.questions).length;

    selected_answers = new Array(q_max);
    for(var i = 0; i<q_max; i++)
	selected_answers[i] = -1;

    clear_last_result();
    refresh_current_question();
    refresh_navigation();

    // $(this).parent().next().toggle();
}

function prep_sel_questions() {
    sel_questions = { "questions" : []};

    var topics = $( "#atc_categories").val().split(", ");
	
    for(var i in data.questions) {
	for(var j in topics) {
	    if(topics[j] == "") continue;
	    if(data.questions[i].cat.indexOf(topics[j]) !== -1)
	    {
		sel_questions.questions.push(data.questions[i]);
		break;
	    }
	}
    }
}

function clear_last_result() {
    $( "#result" ).html("");
    max_correct = 0;
    q_index = 0;
    //sel_questions = { "questions" : []};
}

function refresh_current_question() {
    $( "#ev_question" ).html(sel_questions.questions[q_index].q);

    var answers = "";
    var last_sel_ans = selected_answers[q_index];
    
    for(var answer in sel_questions.questions[q_index].a) {
	answers += "<br><input type=\"radio\" name=\"radio_answer\" value=\"" + answer + "\"";

	if(last_sel_ans == answer) {
	    answers+= " checked=\"checked\"";
	}
	
	answers += ">" + sel_questions.questions[q_index].a[answer] + "</option>";
    }

    $( "#ev_choices" ).html(answers);

    MathJax.Hub.Typeset();
}

function update_selected_answer() {
    var ra = $("input[name='radio_answer']:checked").val();
    if(ra)
	selected_answers[q_index] = ra;
}

function on_click_first() {
    update_selected_answer();

    q_index = 0;
    refresh_current_question();
    refresh_navigation();    
}

function on_click_prev() {
    update_selected_answer();

    if(q_index == 0)
	return;
    
    q_index--;
    refresh_current_question();
    refresh_navigation();    
}

function on_click_next() {
    update_selected_answer();

    if(q_index == q_max-1)
	return;
    
    q_index++;
    refresh_current_question();
    refresh_navigation();    
}

function on_click_last() {
    update_selected_answer();
    
    q_index = q_max - 1;
    refresh_current_question();
    refresh_navigation();    
}

function render_qa() {
    var s = "";
    var q_no = q_index+1;

    s+= "<p><font color=\"black\">"+q_no+") " + sel_questions.questions[q_index].q;

    for(var i in sel_questions.questions[q_index].a) {
	var a_no = parseInt(i)+1;

	s+= "<br>";
	if(i == sel_questions.questions[q_index].ca) {
	    s+= "<font color=\"green\"><b>";
	} else if(i == selected_answers[q_index]) {
	    s+= "<font color=\"red\">";
	} else {
	    s+= "<font color=\"black\">";
	}
	
	s+=a_no+") "+sel_questions.questions[q_index].a[i];

	if(i == sel_questions.questions[q_index].ca) {
	    s+= "</b>";
	}
    }
    
    if(selected_answers[q_index] == -1) {
	s+= "<br><i><b><font color=\"red\">Did not attempt!</b></i>";
    } else if(sel_questions.questions[q_index].ca == selected_answers[q_index]) {
	max_correct++;
    }

    return s;
}

function on_click_finish() {
    update_selected_answer();

    $( "#ev_question").html("");
    $( "#ev_choices").html("");

    $( "#btn_first").prop("disabled", true);
    $( "#btn_next").prop("disabled", true);
    $( "#btn_prev").prop("disabled", true);
    $( "#btn_last").prop("disabled", true);

    var s = "";
    
    for(q_index = 0; q_index < q_max; q_index++) {
	s += render_qa();
    }

    s += "<p><b><font color=\"black\">Final score is: " + max_correct + " / " + q_max + "</b>";

    $( "#result" ).html(s);

    MathJax.Hub.Typeset();

    $( "#accordion" ).accordion("option", "active", 2);
}

function refresh_navigation() {
    $( "#btn_first" ).prop("enabled", q_index != 0);
    $( "#btn_prev" ).prop("enabled", q_index > 0);
    $( "#btn_next" ).prop("enabled", q_index < q_max-1);
    $( "#btn_last" ).prop("enabled", q_index != q_max-1);

    var q_no = q_index + 1;
    $( "#ev_stat" ).html("Question " + q_no + " of " + q_max + "<hr>");
}
