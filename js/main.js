btn.addEventListener('click', async () => {
    // フォームに入力されたテキストの取得
    const textValue = document.getElementById("formText").value;
    // 書籍検索ができるGoogle Books APIのエンドポイントにフォームから取得したテキストを埋め込む
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${textValue}`);
    const data = await res.json();
    const bookItem = document.getElementById("bookItem");
    for (let i = 0; i < data.items.length; i++) {
        // 例外が起きなければtryブロック内のコードが実行される
        try {
            // JSONデータの取得
            // 画像を表示するリンク
            const bookImg = data.items[i].volumeInfo.imageLinks.smallThumbnail;
            // 本のタイトル
            const bookTitle = data.items[i].volumeInfo.title;
            // 本の説明文
            const bookContent = data.items[i].volumeInfo.description;
            // 各書籍のGoogle Booksへのリンク
            const bookLink = data.items[i].volumeInfo.infoLink;
            // 取得したデータを入れるための要素を作成
            const makeElement = document.createElement("div");
            // 要素別に識別できるようにidに数字を埋め込む
            makeElement.setAttribute("id", `bookItem${i}`);
            // 取得した要素に作成した要素を挿入
            bookItem.appendChild(makeElement);
            // 作成した要素を取得
            const getBookItem = document.getElementById(`bookItem${i}`);
            // APIで取得したデータの分だけHTML要素を作成し、取得した要素に埋め込む
            const setBookElement = `
              <div class="container">
                <div class="col">
                  <div class="card shadow-sm">
                      <div class="cardbody">
                          <img src="${bookImg}"><br>
                          <a id="link${i}" class="card-text" target="_blank">${bookTitle}</a>
                          <div class="d-flex justify-content-between align-items-center">
                              <p>${bookContent}</p>
                          </div>
                        </dv>
                      </div>
                      <div class="cardbutton">
                        <button onclick="registerBook('${bookTitle}')">読みたい！</button>
                      </div>
                  </div>
                </div>
              </div>
            `;
            // APIから取得した、実際のGoogle Booksのサイトに飛ばすためのリンクを埋め込む
            getBookItem.innerHTML = setBookElement;
            const link = document.getElementById(`link${i}`);
            link.href = bookLink;
            // 途中で例外が発生した場合はcatchブロック内のコードが実行される
        } catch (e) {
            continue;
        }
    }
  });
  
  // 読みたいボタンを押してタイトルを取得
  function registerBook(title) {
    const titleInput = document.getElementById("title");
    console.log(title );
    titleInput.value = title;
  }
  
  // 登録ボタンのクリックイベント
  $("#save").on("click", function () {
    const key = $("#title").val();
    const data = {
      genre: $('input[name="kinds"]:checked').val(),
      author: $("#author").val(),
      price: $("#price").val(),
      date: "", // 日付を後から追加するための空データ
      comments: "", // 感想を後から追加するための空データ
    };
  
    localStorage.setItem(key, JSON.stringify(data));
    renderList(); // リストを再描画
  
    $('#title').val("");
    $('#author').val("");
    $('#price').val("");
    $('input[name="kinds"]').prop('checked', false);
  });
  
  // 全て削除ボタンのクリックイベント
  $("#clear").on("click", function () {
    localStorage.clear();
    $("#list").empty();
  });
  
  // リストの描画を行う関数
  function renderList() {
    $("#list").empty();
    for(let i = 0; i < localStorage.length; i++){
      const key = localStorage.key(i);
      let value = localStorage.getItem(key);
  
      // 感想は後から追加するのでデフォルト値を設定
      if (value) {
        value = JSON.parse(value);
        if (!value.comments) {
          value.comments = [];
        }
      }
  
      const html = `
      <li class="blist">
        <p class="btitle">${key}</p>
        <div class="bcontent">
          <div class="detail"><p class="left">ジャンル</p><p class="right">${value.genre}</p></div>
          <div class="detail"><p class="left">著者</p><p class="right">${value.author}</p></div>
          <div class="detail"><p class="left">価格</p><p class="right">${value.price}</p></div>
          <div class="detail"><p class="left">感想${value.comments.join(", ")}</p>
            <p class="right"><textarea class="form-textarea" id="comment-${key}" placeholder="感想を残そう！"></textarea></p></div>
          <div class="detail"><p class="left">読んだ日</p><p class="right"><input type="date" id="date-${key}"></p></div>
          <div class="detail"><p class="left"></p><p class="right"><button onclick="addComment('${key}')">読んだ！</button></p></div>
        </div>
      </li>
      `;
      $("#list").append(html);
    }
  }
  
  // コメントを追加
  function addComment(key) {
    const commentInput = $(`#comment-${key}`);  //<textarea> 要素を取得
    const dateInput = $(`#date-${key}`);  //<input> 要素を取得
    const comment = commentInput.val();  //実際のコメントを取得し、commentに代入
    const date = dateInput.val();  //実際の日付を取得し、dateに代入
    
    if (comment) {
      let data = localStorage.getItem(key);
      try {
        data = JSON.parse(data);
      } catch (e) {
        return console.error('Parsing error on', key, data);
      }
  
      // 日付とコメントをプロパティに格納
      data.date = date;
      data.comment = comment;
  
      localStorage.setItem(key, JSON.stringify(data));
  
      moveToRead(key); // 追加した本を読んだ本リストに移動する
    }
  }
  
  // 読んだ本リストに移動
  function moveToRead(key) {
    const readData = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : {};
    
    let data = localStorage.getItem(key);
    try {
      data = JSON.parse(data);
    } catch (e) {
      return console.error('Parsing error on', key, data);
    }
  
    readData[key] = data; // 読んだ本のデータに追加
    localStorage.setItem('read', JSON.stringify(readData)); // 更新
    localStorage.removeItem(key); // 元のリストからは削除
  
    renderList(); // 未読リストを再描画
    renderReadList(); // 読んだリストを再描画
  }
  
  // 読んだ本リストの描画
  function renderReadList() {
    $("#read").empty();
    const readData = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : {};
  
    // 各本のデータを取得し、表示
    for (const key in readData) {
      if (readData.hasOwnProperty(key)) {
        const value = readData[key];
  
        const html = `
          <div class="card-container">
            <div class="card u-clearfix">
              <div class="card-body">
                <span class="card-number card-circle subtle">${value.genre}</span>
                <span class="card-author subtle">${value.author}</span>
                <h2 class="card-title">${key}</h2>
                <div class="card-read">${value.price}円</div>
                <div class="card-date">${value.date}</div>
                <span class="card-description subtle">${value.comment}</span>
              </div>
            </div>
          </div>
        `;
        $("#read").append(html);
      }
    }
  }
  
  // ジャンルのカウント
  function readGenre() {
    // 読んだ本のデータを取得
    const readData = localStorage.getItem('read') ? JSON.parse(localStorage.getItem('read')) : {};
  
    let literature = 0; // "文学"ジャンルのカウント用変数
    let business = 0; // "ビジネス"ジャンルのカウント用変数
    let hobby = 0; // "趣味"ジャンルのカウント用変数
    let education = 0; // "教育"ジャンルのカウント用変数
  
    // 読んだ本のデータをループしてジャンルをチェック
    for(let key in readData){
      let value = readData[key];
      // ジャンルが"趣味"であればカウントアップ
      if (value.genre.includes("文学")) {
        literature++;
      } else if(value.genre.includes("ビジネス")) {
        business++;
      } else if(value.genre.includes("趣味")) {
        hobby++;
      } else if(value.genre.includes("教育")) {
        education++;
      };
    };
  
    const html = `
    <table>
      <tr>
        <th>ジャンル</th>
        <th>冊数</th>
      </tr>
      <tr>
        <td class="icon">文学</td>
        <td>${literature}</td>
      </tr>
      <tr>
        <td class="icon">ビジネス</td>
        <td>${business}</td>
      </tr>
      <tr>
        <td class="icon">趣味</td>
        <td>${hobby}</td>
      </tr>
      <tr>
      <td class="icon">教育</td>
      <td>${education}</td>
      </tr>
    </table>
    `;
    $("#count").append(html);
  }
  
  // ページ読み込み時に両方のリストを描画
  $(document).ready(function() {
    renderList();
    renderReadList();
    readGenre();
  });
  