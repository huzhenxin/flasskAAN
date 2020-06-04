function getEdge(callback) {
    $.ajax({
        url: "/distance_matrix",    //flask中的路由
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
 getEdge(function (edge) {
        //假设我们有129个残基
        // var res = 129;
        console.log(resNum);
        let len = 40 / resNum;
// 渲染器
        const canvas = document.querySelector('#c');
        const renderer = new THREE.WebGLRenderer({canvas});
        renderer.setClearColor(0xffffff);
// 照相机
        var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
        camera.position.z = 26;
// 场景
        const scene = new THREE.Scene();
        console.log(edge[1]);
// 物体模型
        var geometry = new THREE.PlaneGeometry( len,len);
        for(var i=-20,m=0;i<20;i+=len,m++){
            for(var j=-20,n=0;j<20;j+=len,n++){
                if(edge[1][m][n]*10<=2){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xAF0000, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=4){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xFF0000, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=6){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xFF4B00, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=8){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xFF7D00, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=10){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xFFAF00, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=12){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0xFFFF00, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=14){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0x00FFFF, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=16){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0x00AFFF, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else if(edge[1][m][n]*10<=18){
                    var material1 = new THREE.MeshBasicMaterial( {color: 0x0000FF, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }else{
                    var material1 = new THREE.MeshBasicMaterial( {color: 0x00004B, side: THREE.DoubleSide} );
                    var plane = new THREE.Mesh( geometry, material1 );
                    plane.position.set(j+len/2,i+len/2,0);
                    scene.add(plane);
                }
            }
        }
        // for(var i=0;i<edge[1].length;i++){
        //     var material1 = new THREE.MeshBasicMaterial( {color: 0x0b004f, side: THREE.DoubleSide} );
        //     var plane1 = new THREE.Mesh( geometry, material1 );
        //     plane1.position.set(-20+(edge[1][i][0]-1)*len+len/2,-20+(edge[1][i][1]-1)*len+len/2,0);
        //     scene.add(plane1);
        //     var material2 = new THREE.MeshBasicMaterial( {color: 0x0b004f, side: THREE.DoubleSide} );
        //     var plane2 = new THREE.Mesh( geometry, material2 );
        //     plane2.position.set(-20+(edge[1][i][1]-1)*len+len/2,-20+(edge[1][i][0]-1)*len+len/2,0);
        //     scene.add(plane2);
        // }

// // 辅助工具
//         var helper = new THREE.AxesHelper(10);
//         scene.add(helper);

        var controls;

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

        var animate = function () {
            if (resizeRendererToDisplaySize(renderer)) {
                const canvas = renderer.domElement;
                camera.aspect = canvas.clientWidth / canvas.clientHeight;
                camera.updateProjectionMatrix();
            }
            controls.update();
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };

        animate();

//声明raycaster和mouse变量
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();

        function onMouseClick( event ) {

                //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.

                mouse.x = ((event.clientX - $("#c").offset().left + $(document).scrollLeft()) / $("#c").width()) * 2 - 1;
                mouse.y = -((event.clientY - $("#c").offset().top + $(document).scrollTop()) / $("#c").height()) * 2 + 1;

                // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
                raycaster.setFromCamera( mouse, camera );

                // 获取raycaster直线和所有模型相交的数组集合
                var intersects = raycaster.intersectObjects( scene.children );

                console.log(intersects);

                //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
                for (var i = 0; i < intersects.length; i++) {
                    if (intersects[i].object instanceof THREE.Mesh) {
                        if (!Boolean(intersects[i].object.flag)) {
                            intersects[i].object.material.color.set(0xff0000);
                            intersects[i].object.flag = true;
                            break;
                        } else {
                            intersects[i].object.material.color.set(0x0b004f);
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
                    // intersects[i].object.material.color.set(0xfff000);
                    // renderDiv(intersects[i].object);
                    $("#label").css({
                        left: event.clientX + $(document).scrollLeft(),
                        top: event.clientY + $(document).scrollTop(),
                        display: "block"
                    });
                    $("#label").text("edges");
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