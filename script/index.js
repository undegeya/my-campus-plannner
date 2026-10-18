(function (){
    const title=document.getElementById('title');
    const date=document.getElementById('due-date');
    const duration=document.getElementById('duration');
    const tag=document.getElementById('tag');

    const list=document.getElementById('task-list');
    const form=document.getElementById('task-form');

    const search=document.getElementById('search-input');
    const caseSensitive=document.getElementById('case-sensitive');
    const sort=document.getElementById('sort-selecting');

    const clearBtn=document.getElementById('clear-tasks');

    const total=document.getElementById('total-tasks');
    const totalTime=document.getElementById('total-duration');
    const topTag=document.getElementById('top-tag');
    const weekly=document.getElementById('weekly-tasks')

    const cap=document.getElementById('duration-cap');
    const capMessage=document.getElementById('cap-message');

    const importBtn=document.getElementById('import-data');
    const exportBtn=document.getElementById('export-data');

    const formMessage=document.getElementById('form-message');
    const searchMessage=document.getElementById('search-message');
    const dataMessage=document.getElementById('data-message');

    let tasks=JSON.parse(localStorage.getItem('campusPlannerTasks')) || [];

    let sortDirection= 1;
    let lastSort="";

    const titleRegex=/^\S(?:.*\S)?$/;
    const durationRegex=/^(0|[1-9]\d*)$/;
    const dateRegex=/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    const tagRegex=/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/;
    const repeatedWord=/\b(\w+)\s+\1\b/i;

    function save(){
        localStorage.setItem("campusPlannerTasks", JSON.stringify(tasks));
    }

    function makeId(){
        return "task_"+ Date.now() + "_" +Math.floor(Math.random()*1000);
    }

    function clean(text){
        const div=document.createElement("div");
        div.textContent=text;
        return div.innerHTML;
    }

    function showMessage(element,message,good){
        element.textContent=message;
        if(good){
            element.className="message success";
        }else{
            element.className="message error";
        }
    }

    function validTask(task){
        if(!task){
            return false;
        }
        if(!task.id){
            return false;
        }
        if(!titleRegex.test(String(task.title))){
            return false;
        }
        if(repeatedWord.test(String(task.title))){
            return false;
        }
        if(!dateRegex.test(String(task.dueDate))){
            return false;
        }
        if(!durationRegex.test(String(task.duration))){
            return false;
        }
        if(!tagRegex.test(String(task.tag))){
            return false;
        }
        if(!task.createdAt || !task.updatedAt){
            return false;
        }
        return true;

    }
    function addTask(event){
        event.preventDefault();

        const now=new Date().toISOString();

        const newTask={
            id: makeId(),
            title: title.value.trim(),
            dueDate: date.value,
            duration: Number(duration.value),
            tag: tag.value.trim(),
            createdAt: now,
            updatedAt: now
        };

        if (!titleRegex.test(newTask.title)){
            showMessage(formMessage,"Enter valid task title.",false);
            return;
        }
        if (repeatedWord.test(newTask.title)){
            showMessage(formMessage,"Avoid repeated words in task title.",false);
            return;
        }
        if (!tagRegex.test(newTask.tag)){
            showMessage(formMessage,"Enter valid tag.",false);
            return;
        }
        if (!durationRegex.test(String(newTask.duration))){
            showMessage(formMessage,"Enter valid duration and must be a positive integer.",false);
            return;
        }
        if (!dateRegex.test(newTask.dueDate)){
            showMessage(formMessage,"Enter valid due date.",false);
            return;
        }

        tasks.push(newTask);
        save();
        renderTasks();

        form.reset();

        showMessage(formMessage,"Task added successfully.",true);
    }

    function getTasks(){
        let result=[...tasks];
        const text=search.value.trim();
        if (text){
            let regex;
            try{
                regex = new RegExp(text,caseSensitive.checked ? "":"i");
                result = result.filter(function(task){
                    const searchableText=task.title+""+task.tag+""+task.dueDate;
                    return regex.test(searchableText);
                });
                searchMessage.textContent=result.length+"task(s) found.";
            }
            catch(error){
                searchMessage.textContent="Invalid regular expression.";
                return [];
            }
        }
        else{
            searchMessage.textContent="";
        }
        if (sort.value){
            result.sort(function(a,b){
                let comparison=0;

                if(sort.value === "date"){
                    comparison= new Date(a.dueDate) - new Date(b.dueDate);
                }
                if(sort.value === "duration"){
                    comparison=Number(a.duration) - (b.duration);
                }
                if(sort.value === "title"){
                    comparison=a.title.localeCompare(b.title);
                }
                return comparison * sortDirection;
            });
        }
        return result;
    }
    function highlight(text){
        const value=search.value.trim();

        if (!value){
            return clean(text);
        }
        try{
            const regex=new RegExp(value,(caseSensitive.checked ? "":"i") + "g");

            let result="";
            let last=0;
            let match;

            while((match=regex.exec(text)) !== null){
                result += clean(text.slice(last,match.index));

                result+="<mark>"+clean(match[0])+"</mark>";
                 
                last=match.index + match[0].length;

                if (match[0].length === 0){
                    regex.lastIndex++;
                }
            }

            result += clean(text.slice(last));

            return result;
        }
        catch (error){
            return clean(text);
        }
    }
    function formatDate(value){
        if(!value){
            return "";
        }
        const parts= value.split("-");
        if(parts.length !== 3){
            return value;
        }
        return(
            parts[1]+"/"+parts[2]+"/"+parts[0]
        );
    }

    function renderTasks(){
        list.innerHTML="";

        const visibleTasks=getTasks();

        if(visibleTasks.length === 0){
            const emptyRow= document.createElement("tr");

            emptyRow.innerHTML='<td colspan="4">No tasks found</td>';

            list.appendChild(emptyRow);

            updateStats();
            updateCap();

            return;
        }

        visibleTasks.forEach(function (task){
            const row= document.createElement("tr");

            row.innerHTML=`<td>${highlight(task.title)}</td><td>${clean(formatDate(task.dueDate))}</td><td>${clean(String(task.duration))} minutes</td><td>${highlight(task.tag)}</td><td><button class="edit-btn" data-id="${clean(task.id)}" type="button">Edit</button><button class="delete-btn" data-id="${clean(task.id)}" type="button">Delete</button></td>`;

            list.appendChild(row);
        });
        updateStats();
        updateCap();
    }
           
    function updateStats(){
        total.textContent=tasks.length;

        const minutes=tasks.reduce(function(sum,task){ return sum + Number(task.duration); },0);
        const hour= (minutes / 60).toFixed(1);

        totalTime.textContent = minutes + "min(" + hour + "h)";
        
        const tagCounts={};
        
        task.forEach(function (task){
            tagCounts[task.tag]=(tagCounts[task.tag] || 0) + 1;
        });
        let popular="-";

        Object.keys(tagCounts).forEach(
            function (name){
                if(
                    popular === "-" ||
                    tagCounts[name]>
                    tagCounts[popular]
                ){
                    popular = name;
                }
            }
        );
        topTag.textContent=popular;

        const weekAgo= Date.now() - 7*24*60*60*1000;

        const weeklyTasks=tasks.filter(function(task){
            return(
                new Date(task.createdAt).getTime() >= weekAgo
            );
        }).length;
        weekly.textContent= weeklyTasks;
}

function updateCap(){

    const limit=Number(cap.value);
    
    if(!limit){
        capMessage.textContent="";
        capMessage.removeAttribute("aria-live");
        return;
    }

    const minutes=tasks.reduce(function(sum,task){ 
        return sum+ Number(task.duration); 
    },0);

    if (minutes>limit){
        const over=minutes - limit;
        capMessage.textContent="you're over the limit!" + over + " minutes.";
        capMessage.setAttribute("aria-live","assertive");
    }else{
        const remaining=limit - minutes;
        capMessage.textContent="you have " + remaining + " minutes left.";
        capMessage.setAttribute("aria-live","polite");
    }
}
function editTask(id){
    const task = tasks.find(
        function(item){
            return item.id === id;
        }
    );

    if(!task){
        return;
    }

    const newTitle=prompt("task title:",task.title);

    if (newTitle === null){
        return;
    }
    const newDuration=prompt("task duration (minutes):",task.duration);
    if (newDuration === null){
        return;
    }
    const newTag=prompt("task tag:",task.tag);
    if (newTag === null){
        return;
    }
    const updated={
        ...task,
        title: newTitle.trim(),
        duration: Number(newDuration),
        tag: newTag.trim(),
        updatedAt: new Date().toISOString()
    };

    if (!validTask(updated)){
        alert("the info is not valid.")
        return;
    }

    task.title=updated.title;
    task.duration=updated.duration;
    task.tag=updated.tag;
    task.updatedAt=updated.updatedAt;

    save();
    renderTasks();
}
function deleteTask(id){
    const answer=confirm("delete this task?");
    if (!answer){
        return;
    }
    tasks=tasks.filter(function(task){
        return task.id !== id;
    });

    save();
    renderTasks();
}
function clearTasks(){
    if(!tasks.length){
        alert("there is no tasks to clear");
        return;
    }

    const answer= confirm("are you sure you want to clear all tasks");
    if(answer){
        tasks=[];

        save();
        renderTasks();

        showMessage(
            formMessage,"all tasks have been cleared.",true
        );
    }
}

function exportData(){
    const data=JSON.stringify(
        tasks,
        null,
        2
    );
    const file=new Blob([data],{type:"application/json"});

    const link=URL.createElement("a");

    link.href=URL.createObjectURL(file);

    link.download="campus-planner-tasks.json";

    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(link.href);

    showMessage(dataMessage,"Data exported successfully.",true);
}

function importData(event){

    const file=event.target.files[0];

    if (!file){
        return;
    }

    const reader=new FileReader();

    reader.onload=function(){

        try{
            const imported=JSON.parse(reader.result);

            if (!Array.isArray(imported)){
                throw new Error("not array.");
            }

            if (!imported.every(function(task){
                return validTask(tasks);
            })){
                throw new Error("invalid task data.");
            }

            const ids=imported.map(function(task){ task.id});

            if (new Set(ids).size !== ids.length){
                throw new Error("duplicate task ids.");
            }
            tasks=imported;

            save();
            renderTasks();

            showMessage(dataMessage,"Data imported successfully.",true);
        } catch(error){
            showMessage(dataMessage,"Failed to import data: " + error.message, false);
        }
    };

    reader.readAsText(file);

    event.target.value="";
}

form.addEventListener("submit",addTask);

search.addEventListener("input",renderTasks);
caseSensitive.addEventListener("change",renderTasks);
sort.addEventListener("change",function(){
    if(lastSort === sort.value){
        sortDirection *= -1;
    }else{
        sortDirection = 1;
        lastSort = sort.value;
    }
    renderTasks();
});

cap.addEventListener("input",updateCap);

clearBtn.addEventListener("click",clearTasks);

exportBtn.addEventListener("click",exportData);

importBtn.addEventListener("change",importData);

list.addEventListener("click",function(event){
    const id = event.target.dataset.id;
    if(!id){
        return;
    }
    if (event.target.classList.contains("edit-btn")){
        editTask(id);
    }

    if (event.target.classList.contains("delete-btn")){
        deleteTask(id);
    }
});
renderTasks();
})();
