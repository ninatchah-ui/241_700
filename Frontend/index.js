function submitData() {
    let firstNameDom = document.querySelector('input[name=firstname]');
    let lastNameDom = document.querySelector('input[name=lastname]');
    let ageDom = document.querySelector('input[name=age]');
    let genderDom = document.querySelector('input[name=gender]:checked');
    let interestsDom = document.querySelectorAll('input[name=interests]:checked');
    let descriptionDom = document.querySelector('textarea[name=description]');

    let interests = ' '
    for(let i = 0;i<interestsDom.length;i++){
        interests += interestsDom[i].value
        if(i !== interestsDom.length - 1){
            interests += ', '
        }
    }

    let userData = {
        firstName: firstNameDom.value,
        lastName: lastNameDom.value,
        age: ageDom.value,
        gender  :  genderDom.value, 
        description: descriptionDom.value,
        interests: interests 
    }
    console.log('SubmitData', userData);
}