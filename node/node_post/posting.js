$('#submit-btn').click(function(){
	alert("hello");
	alert($("#username").val());
	alert($("#password").val());
	$.ajax({
		type: "POST",
		url: "login",
		contentType: "application/json",
		data: JSON.stringify({
			username: $("#username").val(),
			password: $("#password").val()
		}),
	succes: function(data){
		console.log('data', data);
	}
	});
});

