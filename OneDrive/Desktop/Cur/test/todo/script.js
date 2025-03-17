$(document).ready(function() {
    // 追加ボタンがクリックされたとき
    $('#add-button').on('click', function() {
        addTask();
    });

    // Enterキーが押されたとき
    $('#new-task').on('keypress', function(e) {
        if (e.which === 13) {  // Enterキー
            addTask();
        }
    });

    // タスクを追加する関数
    function addTask() {
        const taskText = $('#new-task').val().trim();
        
        if (taskText !== '') {
            // 新しいタスク要素を作成
            const newTask = $('<li></li>');
            const taskCheckbox = $('<input type="checkbox">').addClass('task-checkbox');
            const taskSpan = $('<span></span>').text(taskText).addClass('task-text');
            const deleteButton = $('<button>削除</button>').addClass('delete-btn');
            
            // 要素を組み立てる
            newTask.append(taskCheckbox, taskSpan, deleteButton);
            
            // リストに追加
            $('#task-list').append(newTask);
            
            // 入力フィールドをクリア
            $('#new-task').val('').focus();
            
            // ローカルストレージに保存
            saveTasks();
        }
    }

    // タスクリストでの操作
    $('#task-list').on('click', '.task-checkbox', function() {
        // チェックボックスがクリックされたとき
        $(this).siblings('.task-text').toggleClass('completed');
        saveTasks();
    });

    $('#task-list').on('click', '.delete-btn', function() {
        // 削除ボタンがクリックされたとき
        $(this).parent().fadeOut(300, function() {
            $(this).remove();
            saveTasks();
        });
    });

    // タスクをローカルストレージに保存
    function saveTasks() {
        const tasks = [];
        
        $('#task-list li').each(function() {
            const taskText = $(this).find('.task-text').text();
            const isCompleted = $(this).find('.task-text').hasClass('completed');
            
            tasks.push({
                text: taskText,
                completed: isCompleted
            });
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // ローカルストレージからタスクを読み込む
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        tasks.forEach(function(task) {
            const newTask = $('<li></li>');
            const taskCheckbox = $('<input type="checkbox">').addClass('task-checkbox');
            const taskSpan = $('<span></span>').text(task.text).addClass('task-text');
            const deleteButton = $('<button>削除</button>').addClass('delete-btn');
            
            if (task.completed) {
                taskSpan.addClass('completed');
                taskCheckbox.prop('checked', true);
            }
            
            newTask.append(taskCheckbox, taskSpan, deleteButton);
            $('#task-list').append(newTask);
        });
    }

    // 初期化時にタスクを読み込む
    loadTasks();
}); 