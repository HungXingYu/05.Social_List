//#region 設定變數
const form = document.querySelector('form')
const validFeedback = document.querySelector('.valid-feedback')
const categoryButton = document.querySelector('#dropdownCategoryButton') 
const searchCategory = document.querySelector('#category')
const searchName = document.querySelector('#searchName')
const cardsPanel = document.querySelector('#cards')
const listPanel = document.querySelector('#cardsList')
const modalTitle = document.querySelector('.modal-title')
const modalImg = document.querySelector('.modal-img')
const modalInfo = document.querySelector('.modal-info')
const modalEmail = document.querySelector('.modal-email')
const paginationPanel = document.querySelector('#pagination')
const displayChangeLink = document.querySelectorAll('#displayTab li a')

const baseAPI ='https://lighthouse-user-api.herokuapp.com/' 
const indexAPI =baseAPI + 'api/v1/users'
let showAPI=baseAPI+'api/v1/users/'


const allPeopleResults = []
let pages =[]
let filteredPerson = []

const cardsPerPageNum = 6
const listPerPageNum = 10
let category = categoryButton.innerHTML.trim().toLowerCase()
let displayTabID 
let totalPages
let pageNumber = 1
let keyword = searchName.value.trim().toLowerCase()



//#endregion

//#region  設定監聽器
displayChangeLink.forEach(a => {
    if(a.classList.contains('active')){
        displayTabID = a.id
        geAllPeopleResults()
    }
    
    a.addEventListener('click' ,()=>{
        displayTabID=a.id
        keyword.length === 0 ? displayContent(allPeopleResults) : displayContent(filteredPerson)
    })
})

searchCategory.addEventListener('click' , (event) =>{
    const target = event.target
    categoryButton.innerHTML = target.innerHTML
})
searchName.addEventListener('click' ,()=>{
    validFeedback.innerHTML = null
})
searchName.addEventListener('keydown' , (event)=>{
    if(event.keyCode === 8){
        validFeedback.innerHTML = null
    }
})
form.addEventListener('submit' , search)


cardsPanel.addEventListener('click' , (event) =>{
    let target = event.target
    if(target.matches('.btn')) getPersonInfo(target.dataset.id , target.id)
})
listPanel.addEventListener('click' , (event)=>{
    let target = event.target
    if(target.matches('.btn') && !target.matches('.btn-contact')) getPersonInfo(target.dataset.id , target.id)
})


//#endregion

//#region 設定函式

/**依照搜尋分類及關鍵字搜尋所有人的資料後顯示符合條件的所有卡片
 * event.preventDefault()-->停止該元素的默認動作
 * @param {*} event 
 */
function search(event) {
    event.preventDefault()
    filteredPerson = []
    category = categoryButton.innerHTML.trim().toLowerCase()
    keyword = searchName.value.trim().toLowerCase()
    
    if(keyword === ""){
        validFeedback.innerHTML = `<p class='text-danger'>您只有輸入空白，無法查詢！</p>`
    }else{
        filteredPerson = allPeopleResults.filter(person => person[category].toLowerCase().indexOf(keyword)>-1)
        //練習三元運算子( if條件 ? 條件為true要做的事 : 條件為false要做的事)
        filteredPerson.length === 0 
            ? validFeedback.innerHTML = `<p class='text-danger'>您輸入的${keyword}，查無資料！</p>`
            : displayContent(filteredPerson)
    }

    form.classList.add('was-validated')
}

/**從API取得全部人員資料
 * 
 * 
 */
function geAllPeopleResults() {
    axios
        .get(indexAPI)
        .then(response =>{
            allPeopleResults.push(...response.data.results)
            displayContent(allPeopleResults)
        })
        .catch(error => console.log(error))
}

/**內容顯示
 * 1. 算出總頁數
 * 2. 顯示分頁
 * 3. 設定分頁內容
 * @param {*} array 
 */
function displayContent(array){
    displayTabID === 'tabCards' 
        ? totalPages = Math.ceil(array.length/cardsPerPageNum) 
        : totalPages = Math.ceil(array.length/listPerPageNum)
    displayPagination(totalPages ,array)
    getPages(totalPages , array)
}


/**顯示Pagination
 * 引用TWBS jQuery Pagination
 * @param {*} totalPages 
 */
function displayPagination(totalPages ,array) {    
    $('#pagination')
        .empty()
        .removeData("twbs-pagination")
        .unbind('page')

    let visiblePages = 7
    if(totalPages < visiblePages){
        visiblePages = totalPages
    }

    $('#pagination').twbsPagination({
        totalPages: totalPages,
        visiblePages: visiblePages,
        onPageClick: function (event, page) {
            pageNumber = page
            displayPerPageResults(pageNumber)
        }
    });
}

/**設定pages物件陣列內容
 * 
 * @param {*} totalPages 
 * @param {*} peopleResults 
 */
function getPages(totalPages , peopleResults) {
    pages = []
    let perPageNum
    displayTabID === 'tabCards' ? perPageNum = cardsPerPageNum : perPageNum = listPerPageNum    
    for(let i = 1 ; i <= totalPages ; i++){
        let startIndex = (i-1)*perPageNum
        pages.push(
            { pageNumber : i , 
              pagePeople : peopleResults.slice(startIndex , startIndex+perPageNum)
            })
    }
    displayPerPageResults(pageNumber)
}

/**顯示該分頁結果
 * 
 * @param {*} pageNum 
 */
function displayPerPageResults(pageNum) {
   displayTabID === 'tabCards' ? cardsPanel.innerHTML = null : listPanel.innerHTML = null
    pages.forEach(page => {
        if(page.pageNumber === pageNum){
            page.pagePeople.forEach(pagePeople => {
                displayTabID === 'tabCards' ? displayPeopleCard(pagePeople) : displayPeopleList(pagePeople)
            })
        }
    })
}

/**顯示人物卡片
 * 
 * @param {*} pagePeople 
 */
function displayPeopleCard(pagePeople) {
    let cardContent =''
    cardContent += 
    `<div class='col-6 col-lg-4  d-flex justify-content-center my-4'>
        <div class="user-card">
            <div class="d-flex justify-content-center">
                <div class="avatar-container">
                    <img src="${pagePeople.avatar}"
                        class="avatar" alt="avatar">
                </div>
            </div>
            <div class="mt-5">
                <div class='card-body'>
                    <h5 class="text-center text-nowrap">${pagePeople.name}<br>${pagePeople.surname}</h5>
                    <hr>
                    <h6 class="text-center">Region:${pagePeople.region}</h6>
                    <h6 class="text-center text-nowrap">Birthday:${pagePeople.birthday}</h6>                                                        
                </div>
                <div class="d-flex justify-content-between">
                    <button type="button" id="btn-info" class="btn btn-info fas fa-info" 
                        data-id = ${pagePeople.id} data-toggle="modal" data-target="#infoModal"></button>
                    <button type="button" id="btn-favorite" class="btn btn-love fas fa-heart" 
                        data-id = ${pagePeople.id}></button>
                </div>
            </div>
        </div>
    </div>`
    cardsPanel.innerHTML += cardContent
}

/**顯示人物列表
 * 
 * @param {*} pagePeople 
 */
function  displayPeopleList(pagePeople) {
    let listContent = ''
    listContent +=
    `<div class='user-list-container col-12 col-lg-6 my-2'>
        <div class="user-list d-flex">
            <div class="d-flex justify-content-center">
                <div class="avatar-container">
                    <img src="${pagePeople.avatar}" class="avatar" alt="avatar">
                </div>
            </div>
            <div class='list-body d-flex flex-column justify-content-center'>
                <h6>
                    <i class="fas fa-globe-americas"> : </i>
                    <span>${pagePeople.region}</span>
                </h6>
                <h6>
                    <i class="fas fa-user"> : </i>
                    <span>${pagePeople.name+" "+pagePeople.surname}</span>
                </h6>
                <h6>
                    <i class="fas fa-calendar-day"> :</i>
                    <span>${pagePeople.age}歲/${pagePeople.birthday}</span>
                </h6>
                <h6>
                    <i class="fas fa-mail-bulk"> :</i>
                    <span>${pagePeople.email}</span>
                </h6>
            </div>
            <div class="d-flex flex-column justify-content-around">
                <button type="button" id="btn-favorite" class="btn btn-love " data-id = ${pagePeople.id}>
                    <i class='fas fa-heart'></i>
                </button>

                <button type="button" id='btn-contact' class="btn btn-contact " onclick="location.href='mailto:${pagePeople.email}'">
                    <i class="fas fa-comment-dots"></i>
                </button>
            </div>
        </div>
    </div>`
    listPanel.innerHTML += listContent
}



/**獲取特定id的人物詳細資料
 * 
 * @param {*} id 
 */
function getPersonInfo(personId , btnId) {
    axios
        .get(showAPI+personId)
        .then(response =>{
            const result = response.data
            if(btnId.indexOf('info') > -1 ){
                displayModal(result)
            }else if(btnId.indexOf('favorite') > -1){
                addToLocalStorageFavoriteList(result)
            }
        })
         .catch(error => console.log(error))
}

/**Modal填入內容
 * 
 * @param {*} result 
 */
function displayModal(result) {
    modalTitle.innerHTML = `${result.name}  ${result.surname}`
    modalImg.src = result.avatar
    modalInfo.innerHTML =
        `<h6>
            <i class="fas fa-calendar-day"> :</i>
            <span>${result.age}歲</span>
        </h6>
        <h6>
            <i class="fas fa-mail-bulk"> :</i>
            <span>${result.email}</span>
        </h6>`
    modalEmail.href =`mailto:${result.email}` 
}



function addToLocalStorageFavoriteList(result) {
    const favoriteList = JSON.parse(localStorage.getItem('favoritePerson'))|| []
    //練習三元運算子( if條件 ? 條件為true要做的事 : 條件為flase要做的事)
    favoriteList.some((listPerson) =>{return listPerson.id === result.id}) ? 
        alert('最愛清單已存在該人物') : 
        (favoriteList.push(result) , localStorage.setItem('favoritePerson' , JSON.stringify(favoriteList)) , alert('成功加入最愛清單'))
}
//#endregion

