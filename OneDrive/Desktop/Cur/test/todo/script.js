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
        const dueDate = $('#due-date').val();
        
        if (taskText !== '') {
            // 新しいタスク要素を作成
            const newTask = $('<li></li>');
            const taskCheckbox = $('<input type="checkbox">').addClass('task-checkbox');
            const taskContent = $('<div></div>').addClass('task-content');
            const taskSpan = $('<span></span>').text(taskText).addClass('task-text');
            const deleteButton = $('<button>削除</button>').addClass('delete-btn');
            
            // 期限表示要素を作成
            const dueDateDisplay = $('<small></small>').addClass('due-date-display');
            if (dueDate) {
                const formattedDate = formatDate(dueDate);
                dueDateDisplay.text(`期限: ${formattedDate}`);
                
                // 期限に応じたクラスを追加
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                const dueDateTime = new Date(dueDate);
                dueDateTime.setHours(0, 0, 0, 0);
                
                const timeDiff = dueDateTime.getTime() - today.getTime();
                const dayDiff = timeDiff / (1000 * 3600 * 24);
                
                if (dayDiff < 0) {
                    dueDateDisplay.addClass('overdue');
                    dueDateDisplay.text(`期限超過: ${formattedDate}`);
                } else if (dayDiff <= 3) {
                    dueDateDisplay.addClass('due-soon');
                }
            } else {
                dueDateDisplay.text('期限なし');
            }
            
            // 要素を組み立てる
            taskContent.append(taskSpan, dueDateDisplay);
            newTask.append(taskCheckbox, taskContent, deleteButton);
            
            // リストに追加
            $('#task-list').append(newTask);
            
            // 入力フィールドをクリア
            $('#new-task').val('').focus();
            $('#due-date').val('');
            
            // ローカルストレージに保存
            saveTasks();
        }
    }

    // 日付を「YYYY/MM/DD」形式にフォーマット
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}/${month}/${day}`;
    }

    // タスクリストでの操作
    $('#task-list').on('click', '.task-checkbox', function() {
        // チェックボックスがクリックされたとき
        $(this).siblings('.task-content').find('.task-text').toggleClass('completed');
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
            const dueDateDisplay = $(this).find('.due-date-display').text();
            
            // 「期限: 2023/01/01」や「期限なし」から日付部分だけを抽出
            let dueDate = '';
            if (dueDateDisplay.includes('期限:')) {
                dueDate = dueDateDisplay.replace('期限: ', '');
            } else if (dueDateDisplay.includes('期限超過:')) {
                dueDate = dueDateDisplay.replace('期限超過: ', '');
            }
            
            tasks.push({
                text: taskText,
                completed: isCompleted,
                dueDate: dueDate
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
            const taskContent = $('<div></div>').addClass('task-content');
            const taskSpan = $('<span></span>').text(task.text).addClass('task-text');
            const deleteButton = $('<button>削除</button>').addClass('delete-btn');
            
            // 期限表示要素を作成
            const dueDateDisplay = $('<small></small>').addClass('due-date-display');
            
            if (task.dueDate) {
                // 保存された日付を解析（YYYY/MM/DD形式を想定）
                const dateParts = task.dueDate.split('/');
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // 月は0から始まる
                    const day = parseInt(dateParts[2]);
                    
                    const dueDate = new Date(year, month, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const timeDiff = dueDate.getTime() - today.getTime();
                    const dayDiff = timeDiff / (1000 * 3600 * 24);
                    
                    dueDateDisplay.text(`期限: ${task.dueDate}`);
                    
                    if (dayDiff < 0) {
                        dueDateDisplay.addClass('overdue');
                        dueDateDisplay.text(`期限超過: ${task.dueDate}`);
                    } else if (dayDiff <= 3) {
                        dueDateDisplay.addClass('due-soon');
                    }
                }
            } else {
                dueDateDisplay.text('期限なし');
            }
            
            if (task.completed) {
                taskSpan.addClass('completed');
                taskCheckbox.prop('checked', true);
            }
            
            taskContent.append(taskSpan, dueDateDisplay);
            newTask.append(taskCheckbox, taskContent, deleteButton);
            $('#task-list').append(newTask);
        });
    }

    // 毎日期限をチェックする機能（ページがロードされたとき）
    function updateDueDateStatus() {
        $('#task-list li').each(function() {
            const dueDateElement = $(this).find('.due-date-display');
            let dateText = dueDateElement.text();
            
            if (dateText.includes('期限:') || dateText.includes('期限超過:')) {
                // 日付部分を抽出
                let dateStr = dateText.replace('期限: ', '').replace('期限超過: ', '');
                const dateParts = dateStr.split('/');
                
                if (dateParts.length === 3) {
                    const year = parseInt(dateParts[0]);
                    const month = parseInt(dateParts[1]) - 1; // 月は0から始まる
                    const day = parseInt(dateParts[2]);
                    
                    const dueDate = new Date(year, month, day);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    const timeDiff = dueDate.getTime() - today.getTime();
                    const dayDiff = timeDiff / (1000 * 3600 * 24);
                    
                    // クラスをリセット
                    dueDateElement.removeClass('overdue due-soon');
                    
                    if (dayDiff < 0) {
                        dueDateElement.addClass('overdue');
                        dueDateElement.text(`期限超過: ${dateStr}`);
                    } else if (dayDiff <= 3) {
                        dueDateElement.addClass('due-soon');
                        dueDateElement.text(`期限: ${dateStr}`);
                    } else {
                        dueDateElement.text(`期限: ${dateStr}`);
                    }
                }
            }
        });
    }

    // 初期化時にタスクを読み込み、期限ステータスを更新
    loadTasks();
    updateDueDateStatus();
}); 