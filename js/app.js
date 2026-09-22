// Task 1 Comparison Trainer
// Loads its content from /data/categories.json + /data/<category>.json
// so new structures or whole new categories can be added by editing JSON only —
// no changes to this file are needed. See README.md for the data format.

(function () {
  var tabbar = document.getElementById('tabbar');
  var container = document.getElementById('cards');
  var countLine = document.getElementById('countLine');

  var categories = [];      // from categories.json
  var cache = {};           // category key -> array of structures
  var activeKey = null;

  function fetchJSON(path) {
    return fetch(path).then(function (res) {
      if (!res.ok) throw new Error('Failed to load ' + path);
      return res.json();
    });
  }

  function toggleReveal(btn) {
    var panel = btn.nextElementSibling;
    panel.hidden = !panel.hidden;
    btn.textContent = panel.hidden ? 'Показати відповідь' : 'Сховати відповідь';
  }

  function buildCard(struct, catColor, catLabel) {
    var card = document.createElement('div');
    card.className = 'card';
    card.style.borderLeftColor = catColor;

    var top = document.createElement('div');
    top.className = 'card-top';

    var pill = document.createElement('span');
    pill.className = 'cat-pill';
    pill.style.background = catColor;
    pill.textContent = catLabel;

    var formula = document.createElement('div');
    formula.className = 'formula';
    formula.textContent = struct.formula;

    top.appendChild(pill);
    top.appendChild(formula);

    var note = document.createElement('p');
    note.className = 'note';
    note.textContent = struct.note;

    var example = document.createElement('div');
    example.className = 'example';
    example.innerHTML = '<b>Приклад</b>' + struct.example;

    card.appendChild(top);
    card.appendChild(note);
    card.appendChild(example);

    (struct.exercises || []).forEach(function (ex, i) {
      var block = document.createElement('div');
      block.className = 'exercise';

      var label = document.createElement('span');
      label.className = 'ex-label';
      label.textContent = 'Речення ' + (i + 1);

      var practice = document.createElement('p');
      practice.className = 'practice-text';
      practice.textContent = ex.practice;

      var input = document.createElement('textarea');
      input.className = 'answer-input';
      input.rows = 2;
      input.placeholder = 'Напиши свій варіант тут...';

      var btn = document.createElement('button');
      btn.className = 'reveal-btn';
      btn.type = 'button';
      btn.textContent = 'Показати відповідь';
      btn.addEventListener('click', function () { toggleReveal(btn); });

      var reveal = document.createElement('div');
      reveal.className = 'reveal';
      reveal.hidden = true;

      var answer = document.createElement('p');
      answer.className = 'answer';
      answer.innerHTML = '<strong>&#10003;</strong> ' + ex.answer;

      var answerNote = document.createElement('p');
      answerNote.className = 'answer-note';
      answerNote.innerHTML = ex.answerNote || '';

      reveal.appendChild(answer);
      reveal.appendChild(answerNote);

      block.appendChild(label);
      block.appendChild(practice);
      block.appendChild(input);
      block.appendChild(btn);
      block.appendChild(reveal);
      card.appendChild(block);
    });

    return card;
  }

  function renderCategory(key) {
    var cat = categories.find(function (c) { return c.key === key; });
    if (!cat) return;

    var items = cache[key] || [];
    var totalEx = items.reduce(function (sum, d) { return sum + (d.exercises ? d.exercises.length : 0); }, 0);
    countLine.textContent = items.length + ' структур · ' + totalEx + ' речень для тренування';

    container.innerHTML = '';
    items.forEach(function (struct) {
      container.appendChild(buildCard(struct, cat.color, cat.label));
    });
  }

  function setActive(key) {
    activeKey = key;
    var tabs = tabbar.querySelectorAll('.tab');
    tabs.forEach(function (t) {
      var cat = categories.find(function (c) { return c.key === t.dataset.cat; });
      if (t.dataset.cat === key) {
        t.classList.add('active');
        t.style.background = cat.color;
      } else {
        t.classList.remove('active');
        t.style.background = '#fff';
      }
    });

    if (cache[key]) {
      renderCategory(key);
    } else {
      container.innerHTML = '<p class="load-msg">Завантаження…</p>';
      fetchJSON('data/' + categories.find(function (c) { return c.key === key; }).file)
        .then(function (data) {
          cache[key] = data;
          if (activeKey === key) renderCategory(key);
        })
        .catch(function (err) {
          container.innerHTML = '<p class="load-msg">Не вдалося завантажити цю категорію: ' + err.message + '</p>';
        });
    }
  }

  function buildTabs() {
    categories.forEach(function (cat) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'tab';
      b.dataset.cat = cat.key;

      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.style.background = cat.color;

      b.appendChild(dot);
      b.appendChild(document.createTextNode(cat.label));
      b.addEventListener('click', function () { setActive(cat.key); });
      tabbar.appendChild(b);
    });
  }

  fetchJSON('data/categories.json')
    .then(function (cats) {
      categories = cats;
      buildTabs();
      if (categories.length) setActive(categories[0].key);
    })
    .catch(function (err) {
      container.innerHTML = '<p class="load-msg">Не вдалося завантажити список категорій: ' + err.message + '</p>';
    });
})();
