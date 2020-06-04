from flask import Flask, render_template, url_for, request, jsonify
import network
import networkx as nx

app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# G表示我们的蛋白所对应的网络，由于我们在后面分析网络性质的时候所使用的是networkx包，
# 所以将网络表示成networkx中所定义的网络形式，由于阈值的选取，需要我们从前端页面获得
# 所以此处为新建一个空的网络，在网络全局性质页面再进行计算。
G = nx.Graph()
# 将边的列表设置成全局性质主要方便一下调用，在可视化模块绘制network3D图的时候，我们需
# 要使用到边的列表
edge = []
# protein中存储的是我们蛋白质的所有信息，从network模块中拿过来，主要使用的信息有坐标信息
# 在绘制network3D的时候会使用到，在绘制distance_matrix时也需要使用到
protein = network.protein


def get_network(f1, f2, energy_cutoff):
    global protein
    global edge
    g = nx.Graph()
    network.readPdb(f1)
    network.readTop(f2)
    for i in protein:
        g.add_node(protein[i].atom[0].chain + protein[i].resNum)
    for i, res_1 in enumerate(network.protein.values()):
        for j, res_2 in enumerate(list(network.protein.values())[i + 2:]):
            total = network.calculateVDM(res_1, res_2) + network.calculateELE(res_1, res_2)
            if total < energy_cutoff:
                g.add_edge(res_1.atom[0].chain + res_1.resNum, res_2.atom[0].chain + res_2.resNum)
                edge.append((res_1.resNum, res_2.resNum))
    return g


# 该视图的初始页面（没有轨迹）的展示
@app.route('/')
def index_pdb():
    return render_template("index_PDB.html")


# 该视图的初始页面（有轨迹）的展示
@app.route('/index_trajectory')
def index_trajectory():
    return render_template("index_trajectory.html")


# 该视图表示网络的全局性质页面，该页面根据初始页面的用户指定参数来计算
# 网络的全局性质
@app.route('/network_global_property', methods=["POST"])
def network_global_property():
    global G
    if request.method == 'POST':
        # 得到用户上传文件：pdb文件和top文件
        # 这里其实应该做一个检查，看用户所上传的文件是否符合条件
        # 如果不符合条件的话，则给一个出错的页面
        # 如何知道所传文件是否符合条件？
        # 最简单的办法应该是获取错误，也就是get_network函数不能执行成功
        f1 = request.files['pdb_file']
        f2 = request.files['top_file']
        G = get_network(f1, f2, int(request.form["Energy"]))
        # list1中存储度为1的节点
        list1 = [k for k, v in G.degree() if v == 0]
        # 如果list1中没有元素，那么也就是说所有的点都在一张图中，那么返回的信息如下
        if len(list1) == 0:
            context = {
                "pdb": f1.name,  # pdb文件名
                # "weight": request.form.get["weight"], # 是否有权重
                "Energy_cutoff": request.form["Energy"],  # 用户所设置的阈值
                "Residue_separation": request.form["Residue_separation"],  # 隔几个残基算一次
                "Nodes": nx.number_of_nodes(G),  # 网络的节点数
                "Edges": nx.number_of_edges(G),  # 网络的边的数目
                # "Diameter": nx.diameter(G),      # 网络的直径
                "Average_degree": 1,  # 网络的平均度
                # "Average_shortest_path": nx.average_shortest_path_length(G), # 网络的平均最短路径
                # "Clustering_coefficient": nx.average_clustering(G)  # 网络的聚类系数的大小
            }

        # 如果list1中有元素，也就是说，蛋白质分成了几部分，那么有些性质可能没有办法计算
        # 可以计算的性质返回如下
        context = {
            "pdb": f1.name,
            # "weight": request.form.get["weight"],
            "Energy_cutoff": request.form["Energy"],
            "Residue_separation": request.form["Residue_separation"],
            "Nodes": nx.number_of_nodes(G),
            "Edges": nx.number_of_edges(G),
        }
        return render_template("network_global_property.html", **context)


# 主要功能模块
# 1. 可视化模块
# 2. 区域可视化
# 3. 节点中心性
# 4. 边的中心性
# 5. 最短路径
# 6. 社区分析

# 1. 以下视图显示的是三种不用的展示：
# ①. network 3D
# ②. contact map
# ③. distance matrix
# 该视图显示的是network 3D
@app.route("/visual", methods=["GET", "POST"])
def visual():
    return render_template("visual.html")


# 该视图返回的是contact_map图
@app.route("/visual_contact_map")
def visual_contact_map():
    global protein
    resNum = len(protein)
    return render_template("visual_contact_map.html", resNum=resNum)


# 该视图返回的是distance_matrix图
@app.route("/visual_distance_matrix")
def visual_distance_matrix():
    global protein
    resNum = len(protein)
    return render_template("visual_distance_matrix.html", resNum=resNum)


@app.route("/distance_matrix", methods=["POST"])
def distance_matrix():
    all_edge = network.distance_matrix("aa.pdb")
    print(all_edge)
    dict3 = {1: all_edge.tolist()}
    return jsonify(dict3)


# 该视图返回的是每一个残基中第一个原子的[残基信息：原子坐标] ，
# 目前采取的是以残基中某个原子的坐标代替整个残基的坐标
@app.route("/visual2", methods=["POST"])
def visual2():
    global protein
    dict1 = dict()
    i = 1
    for residue in protein.values():
        for atom in residue.atom:
            dict1[i] = [atom.chain + residue.resNum + ":" + residue.resName, atom.coordinate]
            i = i + 1
            break
    return jsonify(dict1)


# 该视图返回的是网络中的所有边
@app.route("/visual3", methods=["POST"])
def visual3():
    dict2 = {1: edge}
    return jsonify(dict2)


# 2. 该视图返回的是指定部分残基显示(区域可视化)
@app.route("/domain")
def domain():
    return render_template("domain.html")


# 3. 该视图返回的是网络的节点性质
@app.route("/network_node_property")
def network_node_property():
    global G
    return render_template("network_node_property.html")


# 该视图返回的是度的分布
@app.route("/degree", methods=["GET", "POST"])
def degree():
    global G
    return jsonify(nx.degree_centrality(G))


# 该视图返回的是紧密中心性的分布
@app.route("/closeness", methods=["GET", "POST"])
def closeness():
    global G
    return jsonify(nx.closeness_centrality(G))


# 该视图返回的是中介中心性的分布
@app.route("/betweenness", methods=["GET", "POST"])
def betweenness():
    global G
    return jsonify(nx.betweenness_centrality(G))


# 该视图返回的是特征向量中心性的分布
@app.route("/eigenvector", methods=["GET", "POST"])
def eigenvector():
    global G
    return jsonify(nx.eigenvector_centrality(G))


# 该视图返回的是聚类系数的分布
@app.route("/clustering", methods=["GET", "POST"])
def clustering():
    global G
    return jsonify(nx.clustering(G))


#  4. 该视图返回的是网络的边的性质
@app.route("/edge_property")
def edge_property():
    return render_template("edge_property.html")


# 5. 该视图返回的是可视化最短路径模块
@app.route("/visual_shortest_distance")
def visual_shortest_distance():
    return render_template("visual_shortest_distance.html")


#  6. 该视图返回的是可视化社区分析模块
@app.route("/visual_community_analysis")
def visual_community_analysis():
    return render_template("visual_community_analysis.html")


# 下面显示的是一些辅助模块
# 该视图显示的是开发者联系信息展示页面
@app.route('/contact')
def contact():
    return render_template("contact.html")


# 该视图显示的是帮助页面---解释一下每一个页面的内容以及要求的输入
@app.route('/helps')
def helps():
    return render_template("helps.html")


# 该视图显示的是教程页面，可以写成pdf以提供下载
@app.route('/tutorial')
def tutorial():
    return render_template("tutorial.html")


if __name__ == '__main__':
    app.run()
