
document.addEventListener('DOMContentLoaded', function() {

   const patchTextArea = document.getElementById('patch');
   patchTextArea.addEventListener('drop', function(ev) {
       ev.preventDefault();
       if (ev.dataTransfer.items) {
           // Use DataTransferItemList interface to access the file(s)
           [...ev.dataTransfer.items].forEach((item, i) => {
               // If dropped items aren't files, reject them
               if (item.kind === "file") {
                   const file = item.getAsFile();
                   console.log(`… file[${i}].name = ${file.name}`);
                   const reader = new FileReader();

                   reader.addEventListener(
                       "load",
                       () => {
                           // this will then display a text file
                           patchTextArea.value = reader.result;
                       },
                       false
                   );

                   if (file) {
                       reader.readAsText(file);
                   }
               }
           });
       } else {
           // Use DataTransfer interface to access the file(s)
           [...ev.dataTransfer.files].forEach((file, i) => {
               console.log(`… file[${i}].name = ${file.name}`);
           });
       }

   });
   patchTextArea.addEventListener('dragover', function(ec) {});
});


function loadFile()
{
    const content = document.querySelector(".content");
    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
            const patchTextArea = document.getElementById('patch');
            patchTextArea.value = reader.result;
        },
        false
    );

    if (file) {
        reader.readAsText(file);
    }
}