function getData(callback) {
    $.ajax({
        url: "/visual2",    //flask中的路由
        type: "POST",//请求方式
        data: {"1": "hello"},//传送的数据
        dataType: "json",//传送的数据类型
        success: function (data) { //成功得到返回数据后回调的函数
            callback(data);
        },
        error: function (e) {
            alert("error");
        }
    })
}
function getEdge(callback) {
    $.ajax({
        url: "/visual3",    //flask中的路由
        type: "POST",//请求方式
        data: {"1": "hello"},//传送的数据
        dataType: "json",//传送的数据类型
        success: function (edge) { //成功得到返回数据后回调的函数
            callback(edge);
        },
        error: function (e) {
            alert("error");
        }
    })
}
// getData(function (data) {
//     getEdge(function (edge) {
//         console.log(data);
//         console.log(edge);
//     })
// })
function paint(edgeList,nodeList){
    getData(function (data) {
        getEdge(function (edge) {
            // console.log(edge["edge"]);
            // alert("haha");
    // 渲染器
            const canvas = document.querySelector('#c');
            const renderer = new THREE.WebGLRenderer({canvas});
            renderer.setClearColor(0xffffff);
    // 照相机
            const fov = 75;
            const aspect = 2;  // the canvas default
            const near = 0.1;
            const far = 1000;
            const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
            for (let i in data) {
                camera.position.x = data[i][1][0] + Math.min(Object.keys(data).length / 5, 500);
                camera.position.y = data[i][1][1] + 15;
                camera.position.z = data[i][1][2];
                break;
            }

    // 场景
            const scene = new THREE.Scene();
    // 物体模型
            let geometry = new THREE.SphereGeometry(0.5, 20, 20);
    // var material = new THREE.MeshBasicMaterial( { color: 0x00aaaa } );
            //画点
            var colors = [0xFFAB00,0x00FFFF,0xAF00FF,0xFF9600,0x5AB366];

            for (let i in data) {
                var flag = false;
                let material;
                let j=0
                for(;j<nodeList.length;j++){
                    if(nodeList[j].includes(i)){
                        flag = true;
                        break;
                    }
                }
                if(flag){
                    material = new THREE.MeshBasicMaterial({color: colors[j]});
                }else{
                    material= new THREE.MeshBasicMaterial({color: 0x0d6aff});
                }
                let sphere = new THREE.Mesh(geometry, material);
                sphere.name = data[i][0];
                // console.log(data[i][1]);
                sphere.position.x = data[i][1][0];
                sphere.position.y = data[i][1][1];
                sphere.position.z = data[i][1][2];
                // sphere.position.x = Math.random() * 100 - 50;
                // sphere.position.y = Math.random() * 100 - 50;
                // sphere.position.z = Math.random() * 100 - 50;
                scene.add(sphere);
                // geometry2.vertices.push(new THREE.Vector3(sphere.position.x, sphere.position.y, sphere.position.z));
            }
            //画线
            let material2 = new THREE.LineBasicMaterial({
                color: 0xA9A9A9,
                linewidth: 3,
            });
            console.log(edge[1].length);
            for (var i = 0; i < edge[1].length; i++) {
                // console.log(edge[1][0]);
                var geometry2 = new THREE.Geometry();
                var first = Number(edge[1][i][0]);
                var second = Number(edge[1][i][1]);
                // console.log(first);
                geometry2.vertices.push(new THREE.Vector3(data[first][1][0], data[first][1][1], data[first][1][2]));
                geometry2.vertices.push(new THREE.Vector3(data[second][1][0], data[second][1][1], data[second][1][2]));
                var line = new THREE.Line(geometry2, material2);
                scene.add(line);
                // break;
            }
            // var list = [[83,79],[79,65],[65,78],[78,94],[94,96]];
            // console.log(list);
            var material3  = new THREE.LineMaterial( {
              color: 0xff8000,
              // 线宽度
              linewidth: 6,
            } );

            for (let i=0;i<edgeList.length;i++){
                // console.log(edge[1][0]);
                let geometry3 = new THREE.LineGeometry();
                let first = edgeList[i][0];
                let second = edgeList[i][1];
                // console.log(first);
                let pointArr = [data[first][1][0], data[first][1][1], data[first][1][2],
                                        data[second][1][0], data[second][1][1], data[second][1][2]]
                geometry3.setPositions( pointArr);
                let line = new THREE.Line2(geometry3, material3);
                scene.add(line);
            }


    // 辅助工具
    // var helper = new THREE.AxesHelper(10);
    // scene.add(helper);

            let controls;

            function initControls() {

                controls = new THREE.OrbitControls(camera, renderer.domElement);

                // 如果使用animate方法时，将此函数删除
                //controls.addEventListener( 'change', render );
                // 使动画循环使用时阻尼或自转 意思是否有惯性
                controls.enableDamping = true;
                //动态阻尼系数 就是鼠标拖拽旋转灵敏度
                controls.dampingFactor = 0.1;
                //是否可以缩放
                controls.enableZoom = true;
                //是否自动旋转
                controls.autoRotate = false;
                //设置相机距离原点的最近距离
                controls.minDistance = 1;
                //设置相机距离原点的最远距离
                controls.maxDistance = 1000;
                //是否开启右键拖拽
                controls.enablePan = true;
            }

            initControls();

            function resizeRendererToDisplaySize(renderer) {
                const canvas = renderer.domElement;
                const pixelRatio = window.devicePixelRatio;
                const width = canvas.clientWidth * pixelRatio | 0;
                const height = canvas.clientHeight * pixelRatio | 0;
                const needResize = canvas.width !== width || canvas.height !== height;
                if (needResize) {
                    renderer.setSize(width, height, false);
                }
                return needResize;
            }

            let animate = function () {
                if (resizeRendererToDisplaySize(renderer)) {
                    const canvas = renderer.domElement;
                    camera.aspect = canvas.clientWidth / canvas.clientHeight;
                    camera.updateProjectionMatrix();
                }
                controls.update();
                requestAnimationFrame(animate);
                const canvas = renderer.domElement;
                material3.resolution.set(canvas.clientWidth, canvas.clientHeight);
                renderer.render(scene, camera);
            };

            animate();

    //声明raycaster和mouse变量
            var raycaster = new THREE.Raycaster();
            var mouse = new THREE.Vector2();

            function onMouseClick(event) {

                //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
                // console.log(event);
                mouse.x = ((event.clientX - $("#c").offset().left + $(document).scrollLeft()) / $("#c").width()) * 2 - 1;
                mouse.y = -((event.clientY - $("#c").offset().top + $(document).scrollTop()) / $("#c").height()) * 2 + 1;

                // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
                raycaster.setFromCamera(mouse, camera);

                // 获取raycaster直线和所有模型相交的数组集合
                var intersects = raycaster.intersectObjects(scene.children);
                // intersects[0].flag=true;
                // console.log(intersects[0]);
                //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
                for (var i = 0; i < intersects.length; i++) {
                    // console.log(Boolean(intersects[i].flag));
                    // console.log(intersects[i].object.flag);
                    if (intersects[i].object instanceof THREE.Mesh) {
                        if (!Boolean(intersects[i].object.flag)) {
                            intersects[i].object.material.color.set(0xff0000);
                            intersects[i].object.flag = true;
                            // console.log(Boolean(intersects[i].object.flag));
                            break;
                        } else {
                            intersects[i].object.material.color.set(0x2196f3);
                            intersects[i].object.flag = false;
                        }
                    }
                }
            }

            function renderDiv(object) {
                // 获取窗口的一半高度和宽度
                var halfWidth = $("#c").width() / 2;
                var halfHeight = $("#c").height() / 2;

                // 逆转相机求出二维坐标
                var vector = object.position.clone().project(camera);

                // 修改 div 的位置
                $("#label").css({
                    left: vector.x * halfWidth + halfWidth,
                    top: -vector.y * halfHeight + halfHeight - object.position.y
                });
                // 显示模型信息
                $("#label").text("id:" + object.position.y);
            }

            function onDocumentMouseMove(event) {
                event.preventDefault();
                //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
                // console.log(event);
                mouse.x = ((event.clientX - $("#c").offset().left + $(document).scrollLeft()) / $("#c").width()) * 2 - 1;
                mouse.y = -((event.clientY - $("#c").offset().top + $(document).scrollTop()) / $("#c").height()) * 2 + 1;

                // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
                raycaster.setFromCamera(mouse, camera);

                // 获取raycaster直线和所有模型相交的数组集合
                var intersects = raycaster.intersectObjects(scene.children);
                // intersects[0].flag=true;
                // console.log(intersects[0]);
                //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
                for (var i = 0; i < intersects.length; i++) {
                    if (intersects[i].object instanceof THREE.Mesh) {
                        // intersects[i].object.material.color.set(0xfff000);
                        // renderDiv(intersects[i].object);
                        $("#label").css({
                            left: event.clientX + $(document).scrollLeft(),
                            top: event.clientY + $(document).scrollTop(),
                            display: "block"
                        });
                        $("#label").text("id:" + intersects[i].object.name);
                    }
                }
                // console.log(intersects.length);
                if (intersects.length == 0) {
                    $("#label").css({
                        display: "none"
                    });
                }
            }

            window.addEventListener('click', onMouseClick, false);
            window.addEventListener("mousemove", onDocumentMouseMove, false);
        })
    })
}
// let list = [[83,79],[79,65],[65,78],[78,94],[94,96]];
let edgeList = [];
let nodeList = [["1","2"],["3","4"]];
paint(edgeList,nodeList);
